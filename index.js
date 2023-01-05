exports.handler = async (event, context, callback) => {
	console.log('--LAMBDA LOG');
	console.log('Env', process.env.Env);

	console.log('event', event.Records[0]);

	console.log('body', event.Records[0].body);
	console.log('hotelId', event.Records[0].messageAttributes.hotelId.stringValue);
	console.log('roomId', event.Records[0].messageAttributes.roomId.stringValue);
	console.log('stayId', event.Records[0].messageAttributes.stayId.stringValue);

	const response = {
		statusCode: 200,
		body: JSON.stringify('Lambda execute successful!')
	};

	return response;
};
