var amqp = require('amqplib/callback_api');


const connectionStr = process.env.CONNECTION_STRING;

if (!connectionStr) {
  throw new Error('must specify rabbitmq connection string')
}
amqp.connect(connectionStr, function(error0, connection) {
  if (error0) {
    console.log(error0)
    throw error0;
  }

  console.log('connected connected to rabbitmq;')
  connection.createChannel(function(error1, channel) {
    if (error1) {
      console.log(error1)
      throw error1;
    }
    var queue = process.env.QUEUE_NAME || `demo.queue`;

    channel.assertQueue(queue, {
      durable: true
    });

    const prefetch = Number(process.env.PREFETCH) || 3;
    channel.prefetch(prefetch);
    console.log(`prefetch is set to ${prefetch}`);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
  channel.consume(queue, function(msg) {
    const payload = JSON.parse(msg.content.toString());
  console.log(" [x] Received %s", payload);
  const sleepTime = Number(payload.timeout) * 1000|| 120000;
  console.log(`wait for ${sleepTime} seconds...`)

  setTimeout(() => {
    console.log('finished processing event');
    channel.ack(msg);
  }, sleepTime)

});
  });
});