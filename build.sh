#!/bin/bash

# Function to install and build a project
build_project() {
  local dir=$1
  echo "Building project in $dir"
  cd $dir
  pnpm install
  cd -
}

# Build all submodules in the packages directory
for submodule in packages/*; do
  if [ -d "$submodule" ]; then
    build_project "$submodule"
  fi
done

# Build the main project
echo "Building the main project"
pnpm install
tsc