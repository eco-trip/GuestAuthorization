# GuestAuthorization

Guest Authorization Service

## Local development

To build your application locally on your machine, enter:

```sh
cd deploy
sam build -t ./template.yml --parameter-overrides ParameterKey=URI,ParameterValue=ecotrip-gas-local ParameterKey=Env,ParameterValue=dev
```

To test the code by locally invoking the Lambda using the following command:

```sh
sam local invoke Lambda
```

## Send SQS message

```sh
export AWS_DEFAULT_REGION=eu-west-1
aws sqs send-message \
	--queue-url ${SQSUrl} \
	--message-group-id 'default-group' \
	--message-deduplication-id 'first' \
	--message-body 'first'
```
