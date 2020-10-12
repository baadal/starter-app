#!/bin/bash

nodemon --quiet --watch build/.event/done --exec 'node build/server/index.js'
