const { web, rtm } = require('./slackClient')
const handleMessage = require('./handleMessage')
const handleReaction = require('./handleReaction')
const app = require('express')()
const { getSelf, setSelf } = require('./self')

rtm.on('reaction_added', handleReaction)

rtm.on('message', handleMessage);


// Set up a webserver 
app.listen(process.env.PORT || 3000)

const boot = async () => {
  const { self, team } = await rtm.start();
  setSelf(self)
  console.log('i am awake', self)
}

// Boot immediately
boot()

app.get('/', (req,res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/status', (req, res) => {
  console.log('got status ping')
  if (getSelf() !== undefined) {
    console.log('send online')
    res.send({
      status: 'ONLINE'
    })
  }
  else {
    console.log('send offline')
    res.send({
      status: 'OFFLINE'
    })
  }
})

app.post('/start', async (req, res) => { 
  await boot()
  res.sendStatus(200)
})

app.post('/stop', async (req,res) => {
  await rtm.disconnect();
  setSelf(undefined)
  res.sendStatus(200)
})