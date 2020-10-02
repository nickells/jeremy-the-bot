
const puppeteer = require('puppeteer')
const { web } = require('./slackClient')


const sendScreenshot = async (event, query, firstImageOnly) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  page.setViewport({
    width: 1280,
    height: 1024
  })
  await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`)
  if (firstImageOnly) {
    await page.click('div.islrc > div > a');
    const firstImageUrl = await page.evaluate(() => decodeURIComponent(document.getElementsByClassName('islrc')[0].firstChild.firstChild.href.match(/imgurl=(.*?)&/).pop()));
    await page.goto(firstImageUrl);
    await page.evaluate(() => {
      const img = document.getElementsByTagName('img')[0]
      const { width, height } = img
      const { innerWidth, innerHeight } = window
      if (width > height) {
        if (width < innerWidth) {
          img.style.transform = `scale(${innerWidth / width})`
        }
      }
      else if (height < innerHeight) {
        img.style.transform = `scale(${innerHeight / height})`
      }
    })
  }
  let data = await page.screenshot()
  console.log(data)
  await browser.close()
  
  await web.files.upload({
    channels: event.channel,
    file: data,
    filetype: 'auto',
    filename: query
  })
}


module.exports = sendScreenshot