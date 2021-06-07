const express = require('express')
const app = express()
const { CloudEvent, HTTP } = require('cloudevents')
const port = 8080
const axios = require('axios').default;

const target = process.env.K_SINK

console.log('K_SINK is:', process.env.K_SINK)

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/', async (req, res) => {
  // req.setTimeout(10000);

  const sleepTime = Number(req.body.timeout) * 1000 || 120000;


  console.log('received event>>');
  console.log('req.header', req.headers);
  console.log('body>>', req.body);

  // help with debugging
  req.on('error', (err) => {
    console.log('request error>>', err)
  });

  req.on('close', (err) => {
    console.log('request close>>', err)
  });

  req.on('end', (err) => {
    console.log('request end>>', err)
  });

  // used to test timeout
  console.log(`wait for ${sleepTime}ms...`)

  setTimeout(() => {
    console.log('finished processing event');

    res.status(200).send()
    // send another cloud event

    const ce = new CloudEvent({
      type: 'parse.order.finish',
      source: 'exp.subscriber',
      data: { success: true, time: sleepTime }
    })

    console.log(`Reply event: ${JSON.stringify(ce, null, 2)}`)
    const message = HTTP.binary(ce);
    let headers = message.headers;

    // for some reason, the origianl header returned causing an error on the broker dispatcher
    // https://github.com/knative-sandbox/eventing-rabbitmq/blob/c3aa10cc00b04df6744b45410d59f0cbf7acc1ec/pkg/dispatcher/dispatcher.go#L101
    // I'm investigating and opening issues with them
    headers['content-type'] = 'application/json';
      // due to the content issue, send a post request for now
      // after it's resolved, should be able to reply directly using res.XXX
      axios({
      method: 'post',
      url: target,
      data: message.body,
      headers: headers,
    })
    .then((responseSink) => {
      console.log(`Sent event: ${JSON.stringify(ce, null, 2)}`)
      console.log(`K_SINK responded: ${JSON.stringify({ status: responseSink.status, headers: responseSink.headers, data: responseSink.data }, null, 2)}`)
    })
    .catch(console.error)
    }, sleepTime)
})

  app.get('/liveness', async (req, res) => {
    res.send('ok');
  })

  app.get('/readiness', async (req, res) => {
    res.send('ok');
  })

  const server = app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })

// server.keepAliveTimeout = 10 * 1000;
// server.headersTimeout = 10 * 1000; // This should be bigger than `keepAliveTimeout + your server's expected response time`