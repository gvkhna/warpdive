import {execSync} from 'node:child_process'
import * as glob from 'glob'
import * as path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const protoFiles = glob.sync('proto/**/*.proto').join(' ')
const command = [
  'pnpm',
  'exec',
  'protoc',
  '--proto_path proto',
  '--ts_out=src/generated/',
  '--ts_opt generate_dependencies',
  '--ts_opt long_type_string',
  '--ts_opt add_pb_suffix',
  protoFiles
].join(' ')

console.log('Compiling (web-ts): proto/**/*.proto -> src/generated/')
try {
  execSync(command, {stdio: 'inherit'})
} catch (error) {
  console.error(`CMD: ${command}`)
  console.error(`Compile proto-web-ts failed! Exit Code: ${error.status}`)
  process.exit(error.status)
}
