#!/bin/bash

git pull origin main
npm run build
docker build . -t etiennedemoulin/nodes-lamb
