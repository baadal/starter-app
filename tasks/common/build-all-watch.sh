#!/bin/bash

node tasks/build-extra.mjs
source tasks/common/build-build.sh &
source tasks/common/build-client-watch.sh &
source tasks/common/build-server-watch.sh &
wait
