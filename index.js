const { IoTClient, ListThingsCommand } = require('@aws-sdk/client-iot');
const jwt = require('jsonwebtoken');

const client = new IoTClient({ region: process.env.AWS_DEFAULT_REGION });

const Ok = token => ({
	statusCode: 200,
	body: JSON.stringify(`Successfully update CU with new token ${token}`)
});

const Error = (n, txt) => {
	console.log('ERROR: ', txt);
	return {
		statusCode: n,
		body: JSON.stringify(txt)
	};
};

exports.handler = async (event, context, callback) => {
	try {
		if (!event.Records && event.Records[0]) return Error(400, `Missing event record`);

		const hotelId = event.Records[0].messageAttributes.hotelId.stringValue;
		if (!hotelId) return Error(400, `Missing hotelId parameters`);
		const roomId = event.Records[0].messageAttributes.roomId.stringValue;
		if (!roomId) return Error(400, `Missing roomId parameters`);
		const stayId = event.Records[0].messageAttributes.stayId.stringValue;
		if (!stayId) return Error(400, `Missing stayId parameters`);

		console.log(`hotelId: ${hotelId}`);
		console.log(`roomId: ${roomId}`);
		console.log(`stayId: ${stayId}`);

		const command = new ListThingsCommand({ attributeName: 'roomId', attributeValue: roomId });
		const response = await client.send(command);

		if (response.things.length === 0) return Error(404, `Control Unit Not Found`);
		if (response.things.length > 1) return Error(400, `Multiple Control Unit for same roomId`);

		const cu = response.things[0];
		console.log('Found', cu);

		const token = jwt.sign({ stayId }, process.env.GUEST_JWT_SECRET);

		return Ok(token);
	} catch (err) {
		return Error(500, err);
	}
};
