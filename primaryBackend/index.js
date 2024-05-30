const express = require('express');
const { DynamoDBClient, PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require('uuid');
const { SQSClient, SendMessageCommand ,ReceiveMessageCommand} = require("@aws-sdk/client-sqs");
const cors = require('cors');
const app = express();
app.use(express.json());
require('dotenv').config();


app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

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
    console.log(req.body)
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


app.get('/check-status/:executionId', async (req, res) => {
    const { executionId } = req.params;

    const params = {
        QueueUrl: process.env.QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 0,
        VisibilityTimeout: 0,
    };

    try {
        const data = await sqsClient.send(new ReceiveMessageCommand(params));

        let found = false;
        if (data.Messages) {
            for (const message of data.Messages) {
                const body = JSON.parse(message.Body);
                if (body.executionId === executionId) {
                    found = true;
                    break;
                }
            }
        }

        if (found) {
            res.json({ status: 'pending', result: '' });
        } else {
            const dbParams = {
                TableName: 'code',
                Key: {
                    executionId: { S: executionId },
                },
            };
            const dbData = await DBclient.send(new GetItemCommand(dbParams));
            if (dbData.Item) {
                const status = dbData.Item.status.S;
                const result = dbData.Item.result.S;
                res.json({ status, result });
            } else {
                res.status(404).json({ error: "Execution ID not found" });
            }
        }
    } catch (error) {
        console.error("Error checking status:", error);
        res.status(500).json({ error: "Failed to check status" });
    }
});

app.listen(3000, () => {
    console.log('primary backend listening on port 3000!')
});