// example https://knative.dev/docs/eventing/sources/creating-event-sources/writing-event-source-easy-way/

const axios = require("axios").default;
const express = require('express')
const { CloudEvent, HTTP } = require("cloudevents");

const port = process.env.PORT || 8080;

const sinkUrl = process.env['K_SINK'];
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

console.log("Sink URL is " + sinkUrl);

app.post('/', async (req, res) => {
  console.log('received reply>>>', req.body)
  res.status(200).send();
})

app.post('/reply', async (req, res) => {
  console.log('received reply>>>', req.body)
  res.status(200).send();
})

app.post('/event', async (req, res) => {
  const sleepTime = Number(req.body.timeout) || 120;
  
  try {
    console.log('received event>>');
    console.log('body>>', req.body);
  } catch(e) {
    console.log('invalid cloud event')
    return res.sendStatus(400)
  }

  req.on('error', (err) => {
    console.log('request error>>', err)
  });

  req.on('close', (err) => {
    console.log('request close>>', err)
  });

   req.on('end', (err) => {
    console.log('request end>>', err)
  });

  let eventIndex = 0;
  console.log("Emitting event #" + ++eventIndex);

  // consider to have a standard for souce and type
  const source = `exp.event-producer`;
  const type = `parse.order.start`;
  const data = {timeout: sleepTime, sent_at: Date.now()};
  const ce = new CloudEvent({ type, source, data });
  
  console.log('ce>>>', ce)

  // why binary see: https://knative.dev/docs/eventing/sources/creating-event-sources/writing-event-source-easy-way/
  const message = HTTP.binary(ce)

  console.log('message', message);
  let headers = message.headers;

  // for some reason, the origianl header returned causing an error on the broker dispatcher
  // https://github.com/knative-sandbox/eventing-rabbitmq/blob/c3aa10cc00b04df6744b45410d59f0cbf7acc1ec/pkg/dispatcher/dispatcher.go#L101
  // I'm investigating and opening issues with them
  headers['content-type']='application/json';

  console.log('new header', headers),
  axios({
    method: "post",
    url: sinkUrl,
    data: message.body,
    headers: headers
  })
  // axios({
  //   method: "post",
  //   url: sinkUrl,
  //   data: message.body.data,
  //   headers: message.headers
  // })
  .then(response => {
            // Treat the response
        console.log("Event posted successfully");
        console.log(response.data);
        })
  .catch(err => {
        // Deal with errors
        console.log("Error during event post");
        console.error(err);
  }) 

  res.status(200).send();
})

const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})