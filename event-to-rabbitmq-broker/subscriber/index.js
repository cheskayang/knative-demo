const express = require('express')
const app = express()
const { v4: uuidv4 } = require('uuid');
const port = 8080

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/', async (req, res) => {
  // req.setTimeout(10000);
  
  const sleepTime = Number(req.body.timeout) * 1000|| 120000;
  
  try {
    console.log('received event>>');
    console.log('req.header', req.headers)
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

  // used to test timeout
  console.log(`wait for ${sleepTime}ms...`)

  setTimeout(() => {
    console.log('finished processing event');
    res.status(200).send();
  }, sleepTime)
  // await new Promise(resolve => setTimeout(resolve, sleepTime));

  // console.log('finished processing event');
  // res.sendStatus(200);
  // used to have randomly failed requests
  // test retry
  // if (Math.random() < 0.5) {
  //   console.log('this event is going to success!')
  //   res.send('processed event!');
  // } else {
  //   console.log('this event is going to fail!')
  //   res.status(400).send('sth is wrong!!')
  // }
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