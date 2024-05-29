// Lookup table for all platforms and binary distribution packages
const BINARY_DISTRIBUTION_PACKAGES = {
  'darwin-x64': 'warpdive-darwin-amd64',
  'darwin-arm64': 'warpdive-darwin-arm64',
  'linux-x64': 'warpdive-linux-amd64',
  'linux-arm64': 'warpdive-linux-arm64',
  'win32-x64': 'warpdive-windows-amd64',
  'win32-arm64': 'warpdive-windows-arm64'
}

// Windows binaries end with .exe so we need to special case them.
const binaryName = process.platform === 'win32' ? 'warpdive.exe' : 'warpdive'

// Determine package name for this platform
const platformSpecificPackageName = BINARY_DISTRIBUTION_PACKAGES[`${process.platform}-${process.arch}`]

function getBinaryPath() {
  try {
    // Resolving will fail if the optionalDependency was not installed
    return require.resolve(`${platformSpecificPackageName}/bin/${binaryName}`)
  } catch (e) {
    return require('path').join(__dirname, '..', binaryName)
  }
}

function runBinary(...args) {
  require('child_process').execFileSync(getBinaryPath(), args, {
    stdio: 'inherit'
  })
}

module.exports = {
  binaryName,
  getBinaryPath,
  platformSpecificPackageName,
  runBinary
}
