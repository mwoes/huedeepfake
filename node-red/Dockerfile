FROM balenalib/intel-nuc-node:8

USER root
RUN sed 's/jessie/stretch/g' /etc/apt/sources.list

RUN apt-get update && apt-get dist-upgrade

ENV UDEV=1

# Add node-red user so we aren't running as root.
RUN mkdir /data \
    mkdir /data/content \
    && apt-get install nano \
    && apt-get install udev \
    && apt-get install build-essential \
    git \
    python \
    python-pip \
    wget \
    curl \
    avrdude \
    && usermod -aG dialout root

WORKDIR /usr/src/node-red

# package.json contains Node-RED NPM module and node dependencies
COPY package.json /usr/src/node-red/
RUN npm install
RUN npm install node-red-contrib-resinio
RUN npm install node-red-dashboard
RUN npm install node-red-contrib-credentials
RUN npm install node-red-node-smooth
RUN npm install node-red-node-arduino
RUN npm install node-red-contrib-gpio
RUN npm install firmata
RUN npm install johnny-five
RUN npm install node-pixel
RUN npm install nodebots-interchange
RUN npm install node-red-node-email
RUN npm install node-red-twitter
RUN npm install node-red-contrib-browser-utils
RUN npm install node-red-node-mysql
RUN npm install node-red-node-twilio
RUN npm install node-red-node-serialport
RUN npm install node-red-node-ping
RUN npm install node-red-node-base64
RUN npm install node-red-contrib-web-worldmap
RUN npm install node-red-node-openweathermap
RUN npm install node-red-contrib-process-env
RUN npm install node-red-contrib-modbus
RUN npm install node-red-contrib-string
RUN npm install node-red-contrib-bigtimer
RUN npm install node-red-contrib-jsonfilter
RUN npm install node-red-contrib-counter
RUN npm install node-red-contrib-influxdb
RUN npm install node-red-contrib-npm
RUN npm install node-red-contrib-os
RUN npm install node-red-contrib-httpauth
RUN npm install node-red-contrib-device-stats
RUN npm install node-red-contrib-ui-led
RUN npm install node-red-node-weather-underground
RUN npm install node-red-contrib-hue
RUN npm install node-red-contrib-mssql
RUN npm install node-red-contrib-advance-logger
RUN npm install node-red-contrib-node-webcam
RUN npm install node-red-contrib-admin
RUN npm install node-red-contrib-component-dashboard
RUN npm install node-red-contrib-socketio
RUN npm install node-red-contrib-cpu
RUN npm install node-red-contrib-power-monitor
RUN npm install node-red-contrib-looptimer

COPY ./settings.js /data/settings.js
COPY ./settings.js /root/.node-red/settings.js
COPY ./start.sh /data/start.sh
COPY ./content/ /data/content/

RUN rm -r /root/.node-red \
  && ln -s /data /root/.node-red

# Environment variable holding file path for flows configuration
ENV FLOWS=flows.json

CMD ["bash", "/data/start.sh"]
