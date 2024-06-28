#!/bin/bash

# Function to install and build a project
build_project() {
  local dir=$1
  echo "Building project in $dir"
  cd $dir
  bun install
  cd -
}

# Build the main project
echo "Building the main project"
bun install

# Build all submodules in the packages directory
for submodule in packages/*; do
  if [ -d "$submodule" ]; then
    build_project "$submodule"
  fi
done