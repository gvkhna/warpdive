const {isPlatformSpecificPackageInstalled, platformSpecificPackageName, downloadBinaryFromNpm} = require('./index')

if (!platformSpecificPackageName) {
  throw new Error('Platform not supported!')
}

// Skip downloading the binary if it was already installed via optionalDependencies
if (!isPlatformSpecificPackageInstalled()) {
  console.log('Platform specific package not found. Will manually download binary.')
  downloadBinaryFromNpm()
} else {
  console.log('Platform specific package already installed. Will fall back to manually downloading binary.')
}
