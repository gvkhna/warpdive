import {chromium} from 'playwright'
import * as readline from 'readline'

// run pnpx playwright install

async function main() {
  // Launch the browser
  const browser = await chromium.launch({
    headless: false // Set to false to see the browser UI
  })

  // Create a new page with a specific viewport size
  const page = await browser.newPage({
    viewport: {
      width: 1280,
      height: 727
    },
    deviceScaleFactor: 3
  })

  // Navigate to a URL
  await page.goto('http://localhost:4321/viewer/')

  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  console.log('Press ENTER to take a screenshot, or CTRL+C to exit.')

  // Function to handle screenshot taking
  async function takeScreenshot() {
    // Take screenshot on user input
    await page.screenshot({path: 'screenshot.tmp.png'})
    console.log('Screenshot saved as screenshot.tmp.png')
    console.log('Press ENTER to take another screenshot, or CTRL+C to exit.')
  }

  // Wait for user input
  rl.on('line', async () => {
    await takeScreenshot()
  })

  // Setup listener for close event to clean up browser
  rl.on('close', async () => {
    console.log('Exiting...')
    await browser.close()
    process.exit(0)
  })

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    rl.close() // This triggers the 'close' event handler
  })
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
