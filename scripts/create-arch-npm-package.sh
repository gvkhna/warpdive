#!/bin/bash

OS=$1
ARCH=$2
FULL_BINARY_PATH=$3
VERSION=$4

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
  "name": "${PACKAGE_NAME}",
  "version": "${VERSION}",
  "os": ["${OS}"],
  "cpu": ["${ARCH}"]
}
EOF

# Make the binary executable, if not Windows
if [[ "${OS}" != "windows" ]]; then
  chmod +x "${BIN_FOLDER}/${BINARY}"
fi
