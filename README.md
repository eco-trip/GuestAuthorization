# GuestAuthorization

Guest Authorization Service as AWS Lambda with Docker container triggered by SQS (Simple Queue Service)

## Local development

To build your application locally on your machine, enter:

```sh
cd deploy
sam build \
	-t ./template.yml \
	--parameter-overrides \
	ParameterKey=URI,ParameterValue=ecotrip-gas-local \
	ParameterKey=Env,ParameterValue=dev
```

To test the code by locally invoking the Lambda using the following command:

```sh
sam local invoke Lambda
```

## Send SQS message

The queue is configured as FIFO, need massageGroupID and messageDeduplicationID

```sh
export AWS_DEFAULT_REGION=eu-west-1
aws sqs send-message \
	--queue-url ${SQSUrl} \
	--message-group-id 'default-group' \
	--message-deduplication-id 'first' \
	--message-body 'first'
```

**massageGroupID**

The message group ID is the tag that specifies that a message belongs to a specific message group.

**messageDeduplicationID**

The message deduplication ID is the token used for deduplication of sent messages. If a message with a particular message deduplication ID is sent successfully, any messages sent with the same message deduplication ID are accepted successfully but aren't delivered during the 5-minute deduplication interval.

## IoT Core

- [@aws-sdk/client-iot](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-iot/index.html) to search the `thing`
- [@client-iot-data-plane](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-iot-data-plane/index.html) to manipulate thing's `shadow`
