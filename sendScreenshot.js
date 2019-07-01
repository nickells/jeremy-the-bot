
const puppeteer = require('puppeteer')
const { web } = require('./slackClient')

let browser = undefined

const sendScreenshot = async (event, query) => {
  if (!browser) browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  page.setViewport({
    width: 1280,
    height: 1024
  })
  await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`)
  let data = await page.screenshot()
  await browser.close()
  
  await web.files.upload({
    channels: event.channel,
    file: data,
    filetype: 'auto',
    filename: query
  })
}


module.exports = sendScreenshot