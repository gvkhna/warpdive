#!/bin/bash

# Check for NPM_TOKEN
if [[ -z "${NPM_TOKEN}" ]]; then
  echo "Error: NPM access token not found."
  exit 1
else
  echo "Publishing npm packages..."
fi

# Navigate to the dist/npm directory
cd dist/npm

# Loop through each package directory and publish
for dir in */ ; do
  if [[ -d "$dir" ]]; then
    echo "Publishing package in directory $dir"
    cd "$dir"

    # Run npm publish
    npm publish --access public --non-interactive

    # Navigate back to the parent directory
    cd ..
  fi
done

echo "All npm packages have been published."
