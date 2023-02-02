#!/bin/bash

# LOAD PARAMETERS
source parameters

# DELETE OLD STACK IF EXIST ON CTRL+C
trap "echo; echo \"DELETING THE STACK\"; bash destroy.sh -e ${Env} -p ${Project} -t ${Target} -g ${GitUsername}; exit" INT

# CREATE ECR FOR DOCKERIZE LAMBDA
LambdaECR=$(aws ecr describe-repositories --repository-name ${URI}-ecr | jq -r '.repositories[0].repositoryUri')
if [ "$LambdaECR" = "" ]; then
	LambdaECR=$(aws ecr create-repository --repository-name ${URI}-ecr --image-tag-mutability IMMUTABLE --image-scanning-configuration scanOnPush=true | jq -r '.repository.repositoryUri')
	echo "ECR CREATED: ${LambdaECR}"
else
	echo "ECR EXIST: ${LambdaECR}"
fi

# GET SECTRETS
GUEST_JWT_SECRET=$(echo ${Secrets} | jq .SecretString | jq -rc . | jq -rc '.GUEST_JWT_SECRET')

# SAM BUILD AND DEPLOY
Parameters="ParameterKey=URI,ParameterValue=${URI} ParameterKey=Env,ParameterValue=${Env} ParameterKey=JwtSecret,ParameterValue=${GUEST_JWT_SECRET}"

sam build -t ./template.yml --parameter-overrides "${Parameters}"
sam deploy \
	--template-file .aws-sam/build/template.yaml \
	--stack-name ${URI} \
	--disable-rollback \
	--resolve-s3 \
	--image-repositories Lambda=${LambdaECR} \
	--parameter-overrides "${Parameters}" \
	--capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
	--tags project=${Project} env=${Env} creator=${GitUsername}

if [ "$Env" = "dev" ]; then
	SQS_URL=$(aws cloudformation describe-stacks --stack-name ${URI} --query "Stacks[0].Outputs[?OutputKey=='Queue'].OutputValue" --output text)

	AdministrationPath=../../Administration/
	echo "" >>${AdministrationPath}.env.development
	echo "AWS_SQS_URL=${SQS_URL}" >>${AdministrationPath}.env.development
fi
