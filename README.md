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

https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-iot/classes/listthingscommand.html

aws iot list-things --attribute-name roomId --attribute-value 679bd000-8788-11ed-b513-8d230d5a3729

