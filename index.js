const { IoTClient, ListThingsCommand } = require('@aws-sdk/client-iot');
const { IoTDataPlaneClient, UpdateThingShadowCommand } = require('@aws-sdk/client-iot-data-plane');
const jwt = require('jsonwebtoken');

const iotClient = new IoTClient({ region: process.env.AWS_DEFAULT_REGION });
const iotData = new IoTDataPlaneClient({ region: process.env.AWS_DEFAULT_REGION });

const response = (statusCode, txt) => {
	if (statusCode >= 400) {
		console.log(`ERROR: ${txt}`);
	} else {
		console.log(`OK: ${txt}`);
	}
	return {
		statusCode,
		body: JSON.stringify(txt)
	};
};

const Ok = txt => response(200, txt);
const Error = (n, txt) => response(n, txt);

exports.handler = async (event, context, callback) => {
	try {
		if (!event.Records && event.Records[0]) return Error(400, `Missing event record`);

		const type = event.Records[0].messageAttributes.type.stringValue;
		if (!type) return Error(400, `Missing type parameters`);
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
		const res = await iotClient.send(command);

		if (res.things.length === 0) return Error(404, `Control Unit Not Found`);
		if (res.things.length > 1) return Error(400, `Multiple Control Unit for same roomId`);

		const cu = res.things[0];
		console.log('CU Found:', cu.thingName);

		if (type === 'checkin') {
			const token = jwt.sign({ stayId }, process.env.GUEST_JWT_SECRET);

			const params = {
				thingName: cu.thingName,
				payload: JSON.stringify({
					state: {
						reported: { token }
					}
				})
			};

			await iotData.send(new UpdateThingShadowCommand(params));
			return Ok(`Successfully update ${cu.thingName} with token ${token}`);
		}

		if (type === 'checkout') {
			const params = {
				thingName: cu.thingName,
				payload: JSON.stringify({
					state: {
						reported: { token: null }
					}
				})
			};

			await iotData.send(new UpdateThingShadowCommand(params));
			return Ok(`Successfully token removed from ${cu.thingName}`);
		}

		return Error(500, `Invalid type parameter: ${type}`);
	} catch (err) {
		return Error(500, err);
	}
};
