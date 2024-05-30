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
    }
  })

  // Navigate to a URL
  await page.goto('http://localhost:4321/viewer/')

  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  console.log('Press ENTER to take a screenshot...')

  // Wait for user input
  rl.on('line', async () => {
    // Take screenshot on user input
    await page.screenshot({path: 'screenshot.tmp.png'})
    console.log('Screenshot saved as screenshot.tmp.png')

    // Cleanup
    await browser.close()
    rl.close()
  })
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
