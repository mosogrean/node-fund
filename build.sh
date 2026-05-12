#!/bin/bash
docker buildx build \
  --platform linux/amd64 \
  -t mosogrean/node-fund:v1.0.3 \
  --push .