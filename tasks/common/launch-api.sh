#!/bin/bash

export PLATFORM=api
# TODO: remove unnecessary watch
#nodemon --quiet -e ts,js --watch api --watch starter --exec 'ts-node -r tsconfig-paths/register starter/api/server.ts'
nodemon --quiet -e ts,js --watch api --watch starter --exec 'node build/api/server.js'
