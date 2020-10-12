#!/bin/bash

aws s3 cp build/public "s3://$S3_BUCKET_NAME/" --recursive --cache-control "max-age=2592000,public" --acl "public-read" --exclude "*.gz" --exclude "*.br" --metadata "origin=$INSTANCE_REGION"
