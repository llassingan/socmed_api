const amqp = require('amqplib');
const logger = require('./logging');

 let connection = null
 let channel = null

 const EXCHANGE_NAME = 'socmed_events';

 async function connectRabbitMQ() {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: false });
        logger.info('Connected to RabbitMQ successfully');
        return channel
    } catch (error) {
        logger.error(`Failed to connect to RabbitMQ ${ error }`);
    }
 }



 async function publishMessage(routingKey, message) {
    if (!channel) {
        logger.error('RabbitMQ channel is not established');
        return
    }
    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));
    logger.info(`Message published to exchange ${EXCHANGE_NAME} with routing key ${routingKey}`);
 }
 module.exports = {
    connectRabbitMQ,
    publishMessage
}