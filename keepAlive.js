const http = require('http')

http.get('http://jeremy-the-bot.herokuapp.com/status')

setInterval(() => {
  http.get('http://jeremy-the-bot.herokuapp.com/status')
}, 300000)