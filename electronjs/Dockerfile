FROM balenalib/intel-nuc-node:8-stretch

ENV UDEV=1

# Install other apt deps
RUN apt-get update && apt-get install -y -f \
  apt-utils \
  clang \
  xserver-xorg-core \
  xserver-xorg-input-evdev \
  xserver-xorg-video-fbdev \
  xorg \
  xinput \
  xserver-xorg-input-multitouch \
  libegl1-mesa \
  libegl1-mesa-drivers \
  libgl1-mesa-dri \
  libgl1-mesa-glx \
  libglapi-mesa \
  libgles1-mesa \
  libgles2-mesa \
  libglu1-mesa \
  libdbus-1-dev \
  libgtk2.0-dev \
  libnotify-dev \
  libtxc-dxtn-s2tc0 \
  xserver-xorg-video-intel \
  dbus-x11 \
  mesa-utils \
  mesa-utils-extra \
  libva-drm1 \
  libgl1-mesa-dev \
  libglu1-mesa-dev \
  freeglut3-dev \
  libgnome-keyring-dev \
  libgconf2-dev \
  alsa-utils \
  libasound2-dev \
  libcap-dev \
  libcups2-dev \
  libgtk3.0-cil \
  libxtst-dev \
  libxss1 \
  libnss3-dev \
  fluxbox \
  libsmbclient \
  libssh-4 \
  fbset \
	libusb-1.0 \
	libmotif-dev \
  libexpat-dev \
	wget \
	&& rm -rf /var/lib/apt/lists/*

# Set Xorg and FLUXBOX preferences
RUN mkdir ~/.fluxbox
RUN echo "xset s off" > ~/.fluxbox/startup && echo "xserver-command=X -s 0 dpms" >> ~/.fluxbox/startup
RUN echo "#!/bin/bash" > /etc/X11/xinit/xserverrc \
  && echo "" >> /etc/X11/xinit/xserverrc \
  && echo 'exec /usr/bin/X -s 0 dpms -nocursor -nolisten tcp "$@"' >> /etc/X11/xinit/xserverrc

# Move to app dir
WORKDIR /usr/src/app

# Move package.json to filesystem
COPY ./app/package.json ./

# Install npm modules for the application
RUN JOBS=MAX npm install --unsafe-perm --production \
  && npm cache clean --force \
  && rm -rf /tmp/* && node_modules/.bin/electron-rebuild \
  && npm install url-exists

# Move app to filesystem
COPY ./app ./

# Move ALSA file into filesystem
COPY ./app/.asoundrc.surface /root/.asoundrc

# Add X11 conf info to eliminate tearing
RUN mkdir /etc/X11/xorg.conf.d
COPY ./20-intel.conf /etc/X11/xorg.conf.d/

## uncomment if you want systemd
ENV INITSYSTEM on

# Start app
CMD ["bash", "/usr/src/app/start.sh"]
