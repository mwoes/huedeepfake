#!/bin/bash
udevd &
udevadm trigger

cd /usr/src/node-red/
npm start node-red --userDir /data/ -s /data/settings.js
