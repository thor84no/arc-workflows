/* eslint "global-require": "off" */
const log = require('./_log');
const chalk = require('chalk');
const uuid = require('uuid').v4;
const md5 = require('md5');
const proxyquire = require('proxyquire');
const path = require('path');

const sandbox = require(path.join(process.cwd(), 'src', 'sandbox'));
const overrides = typeof sandbox === 'object' ? sandbox.overrides : {};

module.exports = (app, api, type, queues) => {
    if (queues) {
        console.log('\n', chalk.green(api));
        queues.forEach(queue => {
            const route = `/_queues/${queue}`;
            const path = `${process.cwd()}/src/queues/${queue}`;
            const lambda = proxyquire(path, overrides).handler;
            log({ verb: 'post', route, path });

            app.post(route, (request, response) => {
                if (typeof request.body.MessageBody !== 'undefined' && request.body.Action === 'SendMessage') {
                    response.statusCode = 200;
                    response.setHeader('Content-Type', 'application/xml');
                    response.end(successResponse());
                    // The Lambda should be executed after response has occurred to mimic a queue.
                    const now = +new Date();
                    try {
                        const event = {
                            Records: [
                                {
                                    messageId: uuid(),
                                    receiptHandle: uuid(),
                                    body: request.body.MessageBody,
                                    attributes: {
                                        ApproximateReceiveCount: 1,
                                        SentTimestamp: now,
                                        SenderId: uuid(),
                                        ApproximateFirstReceiveTimestamp: now
                                    },
                                    messageAttributes: {},
                                    md5OfBody: md5(JSON.stringify(request.body)),
                                    eventSource: 'aws:sqs',
                                    eventSourceARN: `arn:aws:sqs:${process.env.AWS_REGION}:000000000000:${queue}`,
                                    awsRegion: process.env.AWS_REGION
                                }
                            ]
                        };
                        const context = {};
                        lambda(event, context, (error) => {
                            if (error) {
                                console.error(error);
                            }
                        });
                    } catch (error) {
                        console.error(error);
                    }
                } else {
                    response(400);
                }
            });
        });
    }
};

const successResponse = () => {
    return `<?xml version="1.0"?>
    <SendMessageResponse xmlns="http://queue.amazonaws.com/doc/2012-11-05/">
        <SendMessageResult>
            <MessageId>1cc0fd36-68a0-4c0c-acf3-2a1395d936e8</MessageId>
            <MD5OfMessageBody>a156173c62736147d1f55004d56144df</MD5OfMessageBody>
        </SendMessageResult>
        <ResponseMetadata>
            <RequestId>4aaab444-5aed-562e-9a36-e07385fd9d03</RequestId>
        </ResponseMetadata>
    </SendMessageResponse>`;
};
