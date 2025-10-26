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


async function consumeMessages(routingKey, callback) {
    if (!channel) {
        await connectRabbitMQ();
    }
    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
    channel.consume(q.queue, (msg) => {
        if (msg!==null) {
            const messageContent = JSON.parse(msg.content.toString());
            callback(messageContent);
            channel.ack(msg);
            logger.info(`Message consumed from exchange ${EXCHANGE_NAME} with routing key ${routingKey}`);
        }
    });
    logger.info(`Subscribed to event: ${EXCHANGE_NAME}`)
}



 module.exports = {
    connectRabbitMQ,
    consumeMessages
}