#!/bin/bash

export PLATFORM=api
nodemon --quiet -e ts,js --watch api --watch starter --config starter/config/nodemon.json --exec 'ts-node -r tsconfig-paths/register starter/api/server.ts'
