import * as fs from 'node:fs'
import * as path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const destination = path.join(__dirname, '..', 'src', 'generated')
const filesToClean = path.join(destination, '**', '*')

console.log(`Cleaning (ts): ${filesToClean}`)
const deleteFiles = (dir: string) => {
  fs.readdirSync(dir).forEach((file) => {
    const currentPath = path.join(dir, file)
    if (fs.lstatSync(currentPath).isDirectory()) {
      deleteFiles(currentPath)
    } else if (file !== '.keep') {
      fs.unlinkSync(currentPath)
    }
  })
}

deleteFiles(destination)
