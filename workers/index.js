const express = require('express');
const safeEval = require('safe-eval');
const { DynamoDBClient, UpdateItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");
require('dotenv').config();
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


const processMessage = async (message) => {
    try {
        const { executionId } = JSON.parse(message.Body);

        const { Item } = await DBclient.send(new GetItemCommand({
            TableName: 'code',
            Key: {
                executionId: { S: executionId },
            },
        }));

        if (!Item) {
            console.log("Item not found for executionId:", executionId);
            return;
        }


        const { code } = Item;
        let outputString = '';

        try {
            const output = await safeEval(code.S);
            outputString = output != null || output != undefined ? output.toString() : 'Code did not return any output';
        } catch (error) {
            outputString = "this code cant be executed";
        }

        // Update DynamoDB with the result
        const input = {
            TableName: 'code',
            Key: {
                executionId: { S: executionId },
            },
            UpdateExpression: 'SET #status = :status, #result = :result',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#result': 'result'
            },
            ExpressionAttributeValues: {
                ':status': { S: 'Executed' },
                ':result': { S: outputString },
            },
        };

        await DBclient.send(new UpdateItemCommand(input));

        // Delete the message from SQS after processing
        await sqsClient.send(new DeleteMessageCommand({
            QueueUrl: process.env.QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle,
        }));

    } catch (error) {
        console.error("Error processing message:", error);
    }
};


const processMessages = async () => {
    while (true) {
        try {
            const { Messages } = await sqsClient.send(new ReceiveMessageCommand({
                QueueUrl: process.env.QUEUE_URL,
                WaitTimeSeconds: 10,
            }));

            if (Messages && Messages.length > 0) {
                for (const message of Messages) {
                    await processMessage(message);
                }
            }
        } catch (error) {
            console.error("Error receiving messages:", error);
        }

        await new Promise(resolve => setTimeout(resolve, 10000));
    }
};

processMessages();

const port = 4000;
app.listen(port, () => {
    console.log(`Primary backend listening on port ${port}!`);
});
