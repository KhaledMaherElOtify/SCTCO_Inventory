#!/bin/bash
echo "Building CSTCO Inventory Frontend..."
cd "$PWD/frontend"
npm run build
exit $?
