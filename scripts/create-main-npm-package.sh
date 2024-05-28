#!/bin/bash

# Define base directories
SOURCE_DIR="warpdive"
TARGET_DIR="dist/npm/warpdive"
VERSION=$1

# Create necessary directories
mkdir -p "${TARGET_DIR}/bin/"

# Copy the JavaScript files
cp "${SOURCE_DIR}/bin/cli" "${TARGET_DIR}/bin"
cp "${SOURCE_DIR}/install.js" "${TARGET_DIR}/"

# Create package.json
cat > "${TARGET_DIR}/package.json" <<EOF
{
  "name": "warpdive",
  "version": "0.0.1",
  "description": "Main package for Warpdive",
  "bin": {
    "warpdive": "bin/cli"
  },
  "scripts": {
    "postinstall": "node ./install.js"
  },
  "optionalDependencies": {
    "warpdive-darwin-amd64": "0.0.1",
    "warpdive-darwin-arm64": "0.0.1",
    "warpdive-linux-amd64": "0.0.1",
    "warpdive-linux-arm64": "0.0.1",
    "warpdive-windows-amd64": "0.0.1",
    "warpdive-windows-arm64": "0.0.1"
  },
  "keywords": ["warpdive", "cli"],
  "author": "Gaurav Khanna"
}
EOF

echo "Main npm package is prepared."
