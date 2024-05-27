const express = require('express');
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require('uuid');
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const app = express();
app.use(express.json());
require('dotenv').config();

const config = {
    region: "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
};
const DBclient = new DynamoDBClient(config);
const sqsClient = new SQSClient(config);

app.post('/submit-code', async (req, res) => {
    const executionId = uuidv4();
    const { code } = req.body;

    const input = {
        TableName: 'code',
        Item: {
            executionId: { S: executionId },
            code: { S: code },
            status: { S: 'pending' },
            result: { S: '' },
        },
    };

    try {
        await DBclient.send(new PutItemCommand(input));

        const sqsParams = {
            QueueUrl: process.env.QUEUE_URL,
            MessageBody: JSON.stringify({ executionId }),
            MessageDeduplicationId: executionId,
            MessageGroupId: "CodeSubmissionGroup",
        };

        await sqsClient.send(new SendMessageCommand(sqsParams));

        res.json({ executionId, message: "Code submitted successfully" });

    } catch (error) {
        console.error("Error submitting code:", error);
        res.status(500).json({ error: "Failed to submit code" });
    }
});


app.listen(3000, () => {
    console.log('primary backend listening on port 3000!')
});