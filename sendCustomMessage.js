const { web, rtm } = require('./slackClient')
const args = require('args-parser')(process.argv)

console.info(args)

const go = async () => {
  await rtm.start()
  await web.chat.postMessage({
    text: args.m,
    channel: args.c
  })
  process.exit(0)
}

go()