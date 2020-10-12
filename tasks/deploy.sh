#!/bin/bash

export NODE_ENV=production
if [ $IGNORE_BUILD != 'true' ]
then
  run-s build:prod
fi
source tasks/common/cdn-deploy.sh
#run-s pm2:stop
pm2 start build/server/index.js --name starter-web --time
pm2 start build/api/server.js --name starter-api --time --update-env
