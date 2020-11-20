const { web, rtm } = require('./server/slackClient')
const { getSelf } = require('./server/self')
const args = require('args-parser')(process.argv)

console.info(args)

const go = async () => {
  await rtm.start()
  await web.chat.postMessage({
    text: args.m,
    channel: args.c,
    as_user: false,
    username: args.u
  })
  process.exit(0)
}

go()