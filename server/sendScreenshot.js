const puppeteer = require('puppeteer')
const { web } = require('./slackClient')

const https = require('https');
const http = require('http')

const getBufferFromRequest = (url) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, resp => {
      const dataArray = []
      resp.on('data', (data) => { 
        dataArray.push(data)
      });
      resp.on('end', () => {
        resolve(Buffer.concat(dataArray))
      });
    }).on('error', (e) => {
      reject(e.message)
    });
  })
}

const getCroppedScreenshot = async (page, firstImageUrl) => {
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
  return page.screenshot()
}

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

  // either a page screenshot or an img
  let data

  if (firstImageOnly) {
    await page.click('div.islrc > div > a');
    const firstImageUrl = await page.evaluate(() => decodeURIComponent(document.getElementsByClassName('islrc')[0].firstChild.firstChild.href.match(/imgurl=(.*?)&/).pop()));
    try {
      data = await getBufferFromRequest(firstImageUrl)
    }
    catch (e) {
      console.warn('error fetching', e)
      data = await getCroppedScreenshot(page, firstImageUrl)
    }
    if (data.length === 0) data = await getCroppedScreenshot(page, firstImageUrl)
  }

  await browser.close()
  
  await web.files.upload({
    channels: event.channel,
    file: data,
    filetype: 'auto',
    filename: query
  })
}


module.exports = sendScreenshot