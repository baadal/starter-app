#!/bin/bash

wait-on build/.event/done
source tasks/common/launch-server.sh
