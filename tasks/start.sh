#!/bin/bash

npm run -s verify
npm run -s clean
source tasks/common/build-all-watch.sh &
source tasks/common/launch-server-wait.sh &
source tasks/common/launch-api-watch.sh &
run-s --silent type-check:watch &
wait
