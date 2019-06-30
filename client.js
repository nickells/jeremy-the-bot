const { RTMClient } = require('@slack/rtm-api');
const { WebClient } = require('@slack/web-api');
try {
  const config = require('./config.json')
} catch (e) {
  console.log('no config. this is expected if running from heroku')
}

const token = process.env.SLACK_BOT_TOKEN || config.TOKEN;

const rtm = new RTMClient(token)
const web = new WebClient(token)

module.exports = {
  rtm,
  web
}