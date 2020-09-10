const stopword = require('stopword')
const { getSelf } = require('./self')
const messageHistory = require('./messageHistory')
const sendScreenshot = require('./sendScreenshot')
const { delay } = require('./util')
const { web, rtm } = require('./slackClient')
const { getEmojiList } = require('./emojiList')


module.exports = async (event) => {
  const self = getSelf()

  if (!messageHistory[event.channel]) {
    messageHistory[event.channel] = []
  }
  if (messageHistory[event.channel].length > 5) {
    messageHistory[event.channel].pop()
  }

  // Add message to queue
  messageHistory[event.channel].unshift(event)

  console.log("messageHistory: ", messageHistory)

  try {

    /*
     * thick -> thicc
     * if (event.text.match(/ick\b/g)) {
     *   await web.chat.postMessage({
     *     text: event.text.replace(/ick\b/g, 'icc'),
     *     channel: event.channel,
     *     thread_ts: event.ts
     *   })
     * }
     * Look something up
     */
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
    else if (event.text.includes(', pull that up') || (event.text.match(/[W|w]hat[\'|\’]?s that/) && event.text.match(/[W|w]hat[\'|\’]?s that/).length)) {
      // React to the message
      const lastMessage = messageHistory[event.channel][1]
      if (!lastMessage) return

      await web.reactions.add({
        channel: event.channel,
        timestamp: event.ts,
        name: 'eyes'
      });
      const query = stopword.removeStopwords(lastMessage.text.split(' ')).join(' ')
      await sendScreenshot(event, query)
    }

    /*
     * Pay respects
     * if (event.text === 'F' 
     *   && event.subtype !== 'bot_message'
     *   && messageHistory[event.channel][1]
     *   && messageHistory[event.channel][1].text === 'F'
     *   && messageHistory[event.channel][1].subtype !== 'bot_message'
     * ) {
     *   await web.chat.postMessage({
     *     text: 'F',
     *     channel: event.channel
     *   })
     *   // messageHistory[event.channel] = []
     * }
     */

    else if (
      messageHistory[event.channel][1] && messageHistory[event.channel][1].text === event.text
      && messageHistory[event.channel][1].subtype !== 'bot_message'
      && event.subtype !== 'bot_message'
    ) {
      await web.chat.postMessage({
        text: event.text,
        channel: event.channel
      })
    }

    // Self awareness
    if (event.text.match(/[j|J]eremy/) || event.text.includes(self.id)) {
      await web.reactions.add({
        channel: event.channel,
        timestamp: event.ts,
        name: 'wave'
      });
    }

    // Respond to "thanks" if someone says it to Jeremy
    if (
      (event.text.match(/[t|T]hanks/) || event.text.match(/[n|N]ice/))
      && !event.text.match(/[n|N]o/)
      && messageHistory[event.channel][1]
      && (
        messageHistory[event.channel][1].username === self.name
        || messageHistory[event.channel][1].user === self.id
      )
    ) {
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

    if (event.text === 'respond_jerm') {
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

    // React to a message if it contains a word matching an emoji
    const emojiList = getEmojiList()
    const words = stopword.removeStopwords(event.text.toLowerCase().split(' '))
    await delay(1000)
    for (let word of words) {
      if (emojiList.includes(word)) {
        await delay(300)
        await web.reactions.add({
          channel: event.channel,
          timestamp: event.ts,
          name: word
        });
      }
    }

  } catch (error) {
    console.log('An error occurred', error);
  }

}