const sendScreenshot = require('./sendScreenshot')
const { web, rtm } = require('./client')
const delay = (time) => new Promise((resolve) => setTimeout(resolve, time))
const stopword = require('stopword')
const app = require('express')()

let self = undefined

const messageHistory = {
  // channelId: [5 item queue]
}

rtm.on('reaction_added', async event => {
  
  // Don't react on top of self
  if (event.user === self.id) return

  // 🍆🔨
  if (event.reaction === 'watermelon') {
    // React to the message
    try {
      await web.reactions.add({
        channel: event.item.channel,
        timestamp: event.item.ts,
        name: 'eggplant'
      });
    } catch (error) {
      console.log('An error occurred', error);
    }
    try {
      await web.reactions.add({
        channel: event.item.channel,
        timestamp: event.item.ts,
        name: 'hammer'
      });
    } catch (error) {
      console.log('An error occurred', error);
    }
  } else {
    await delay(3000)
    try {
      // React to the message, sometimes
      if (Math.random() > 0.77) {
        await web.reactions.add({
          channel: event.item.channel,
          timestamp: event.item.ts,
          name: event.reaction
        });
      }
    } catch (error) {
      console.log('An error occurred', error);
    }
  }
})



rtm.on('message', async (event) => {
  if (!messageHistory[event.channel]) {
    messageHistory[event.channel] = []
  }
  if (messageHistory[event.channel] > 5) {
    messageHistory[event.channel].pop()
  }

  try {
    // Look something up
    if (event.text.match(/[W|w]hat means (.*)/)) {
      // React to the message
      await web.reactions.add({
        channel: event.channel,
        timestamp: event.ts,
        name: 'eyes'
      });
      const query = event.text.match(/[W|w]hat means (.*)/)[1]
      await sendScreenshot(event, query)
    }

    // Look up the previous message
    else if (event.text.match(/[W|w]hat[\'|\’]?s that/) && event.text.match(/[W|w]hat[\'|\’]?s that/).length) {
      // React to the message
      const lastMessage = messageHistory[event.channel][0]
      if (!lastMessage) return

      await web.reactions.add({
        channel: event.channel,
        timestamp: event.ts,
        name: 'eyes'
      });
      const query = stopword.removeStopwords(lastMessage.text.split(' ')).join(' ')
      await sendScreenshot(event, query)
    }

    // Pay respects
    else if (event.text === 'F' 
      && event.username !== self.name
      && messageHistory[event.channel][0]
      && messageHistory[event.channel][0].text === 'F'
    ) {
      await web.chat.postMessage({
        text: 'F',
        channel: event.channel
      })
      messageHistory[event.channel] = []
    }

    // Self awareness
    else if (event.text.match(/[j|J]eremy/) || event.text.includes(self.id) ) {
      await web.reactions.add({
        channel: event.channel,
        timestamp: event.ts,
        name: 'wave'
      });
    }
    else if (
      event.text.match(/[t|T]hanks/) 
      && !event.text.match(/[n|N]o/) 
      && messageHistory[event.channel][0]
      && (
        messageHistory[event.channel][0].username === self.name
        || messageHistory[event.channel][0].user === self.id
      ) 
    ){
      let options = [
        'no worries',
        'any time',
        'you\'re welcome!'
      ]
      let text = options[Math.floor(Math.random() * options.length)]
      await delay(1000)
      await web.chat.postMessage({
        text: text,
        channel: event.channel
      })
    }
    else if (event.text === 'hello jeremy') {
      let options = [
        'hey',
        'hello',
        'hi there!'
      ]
      let text = options[Math.floor(Math.random() * options.length)]
      await delay(1000)
      await web.chat.postMessage({
        text: text,
        channel: event.channel
      })
    }
    
  } catch (error) {
    console.log('An error occurred', error);
  }

  // Manage queue length
  messageHistory[event.channel].unshift(event)
});



// Set up a webserver 
app.listen(process.env.PORT || 3000)

const boot = async () => {
  const { self: _self, team } = await rtm.start();
  self = { ..._self }
  console.log('i am awake', self)
}

// Boot immediately
boot()

app.get('/', (req,res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/status', (req, res) => {
  if (self !== undefined) {
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
  self = undefined
  res.sendStatus(200)
})