#!/bin/bash

# Define base directories
SOURCE_DIR="warpdive"
TARGET_DIR="dist/npm/warpdive"

# Get the current Git tag
VERSION=$(git describe --tags --abbrev=0)

# Create necessary directories
mkdir -p "${TARGET_DIR}/bin/"

# Copy the JavaScript files
cp "${SOURCE_DIR}/bin/cli" "${TARGET_DIR}/bin"
cp "${SOURCE_DIR}/install.js" "${TARGET_DIR}/"

# Create package.json
cat > "${TARGET_DIR}/package.json" <<EOF
{
  "author": "Gaurav Khanna",
  "description": "Warpdive is a docker/oci container layer browser. Learn more at warpdive.xyz.",
  "keywords": ["warpdive", "cli"],
  "name": "warpdive",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/gvkhna/warpdive.git"
  },
  "version": "${VERSION}",
  "bin": {
    "warpdive": "bin/cli"
  },
  "scripts": {
    "postinstall": "node ./install.js"
  },
  "optionalDependencies": {
    "warpdive-darwin-amd64": "${VERSION}",
    "warpdive-darwin-arm64": "${VERSION}",
    "warpdive-linux-amd64": "${VERSION}",
    "warpdive-linux-arm64": "${VERSION}",
    "warpdive-windows-amd64": "${VERSION}",
    "warpdive-windows-arm64": "${VERSION}"
  }
}
EOF

echo "Main npm package is prepared."
