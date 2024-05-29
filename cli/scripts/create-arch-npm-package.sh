#!/bin/bash

OS=$1
ARCH=$2
FULL_BINARY_PATH=$3
VERSION=$4

# Function to check if an argument is missing
check_arg() {
    if [[ -z "$1" ]]; then
        echo "Error: Missing argument for $2."
        exit 1
    fi
}

# Check all arguments
check_arg "$OS" "operating system (OS)"
check_arg "$ARCH" "architecture (ARCH)"
check_arg "$FULL_BINARY_PATH" "full binary path (FULL_BINARY_PATH)"
check_arg "$VERSION" "version (VERSION)"

# Extract the binary name
BINARY=$(basename "$FULL_BINARY_PATH")

# Define the root distribution directory assuming this script runs at the project root
DIST_DIR="dist"
NPM_DIR="${DIST_DIR}/npm"

# Define the package-specific directory structure
PACKAGE_NAME="warpdive-${OS}-${ARCH}"
PACKAGE_DIR="${NPM_DIR}/${PACKAGE_NAME}"
BIN_FOLDER="${PACKAGE_DIR}/bin"

# Create the package directory and binary folder
mkdir -p "${BIN_FOLDER}"

# Copy the binary to the binary folder
cp "${FULL_BINARY_PATH}" "${BIN_FOLDER}/"

# Create package.json
cat > "${PACKAGE_DIR}/package.json" <<EOF
{
  "author": "Gaurav Khanna",
  "cpu": ["${ARCH}"],
  "name": "${PACKAGE_NAME}",
  "os": ["${OS}"],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/gvkhna/warpdive.git"
  },
  "version": "${VERSION}"
}
EOF

# Make the binary executable, if not Windows
if [[ "${OS}" != "windows" ]]; then
  chmod +x "${BIN_FOLDER}/${BINARY}"
fi
