const electron = require('electron');
const path = require('path');
const { exec } = require('child_process');
const wanT = require('dns');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const {
  app,
  BrowserWindow,
} = electron;

// simple parameters initialization
const electronConfig = {
  URL_LAUNCHER_TOUCH: process.env.URL_LAUNCHER_TOUCH === '0' ? 1 : 0,
  URL_LAUNCHER_TOUCH_SIMULATE: process.env.URL_LAUNCHER_TOUCH_SIMULATE === '1' ? 1 : 0,
  URL_LAUNCHER_FRAME: process.env.URL_LAUNCHER_FRAME === '1' ? 1 : 0,
  URL_LAUNCHER_KIOSK: process.env.URL_LAUNCHER_KIOSK === '0' ? 1 : 0,
  URL_LAUNCHER_NODE: process.env.URL_LAUNCHER_NODE === '1' ? 1 : 0,
  URL_LAUNCHER_WIDTH: parseInt(process.env.URL_LAUNCHER_WIDTH || 1920, 10),
  URL_LAUNCHER_HEIGHT: parseInt(process.env.URL_LAUNCHER_HEIGHT || 1080, 10),
  URL_LAUNCHER_TITLE: process.env.URL_LAUNCHER_TITLE || 'Harbor Retail',
  URL_LAUNCHER_CONSOLE: process.env.URL_LAUNCHER_CONSOLE === '1' ? 1 : 0,
  URL_LAUNCHER_URL: process.env.URL_LAUNCHER_URL || `file:///${path.join(__dirname, 'data', 'index.html')}`,
  URL_LAUNCHER_ZOOM: parseFloat(process.env.URL_LAUNCHER_ZOOM || 1.0),
  URL_LAUNCHER_OVERLAY_SCROLLBARS: process.env.URL_LAUNCHER_OVERLAY_SCROLLBARS === '0' ? 1 : 0,
  ELECTRON_ENABLE_HW_ACCELERATION: process.env.ELECTRON_ENABLE_HW_ACCELERATION === '0',
  ELECTRON_RESIN_UPDATE_LOCK: process.env.ELECTRON_RESIN_UPDATE_LOCK === '1',
  ELECTRON_APP_DATA_DIR: process.env.ELECTRON_APP_DATA_DIR,
  ELECTRON_USER_DATA_DIR: process.env.ELECTRON_USER_DATA_DIR,
  ELECTRON_MULTI_DISPLAY: process.env.ELECTRON_MULTI_DISPLAY === '0' ? 1 : 0,
  URL_LAUNCHER_FRAME_2: process.env.URL_LAUNCHER_FRAME_2 === '1' ? 1 : 0,
  URL_LAUNCHER_KIOSK_2: process.env.URL_LAUNCHER_KIOSK_2 === '0' ? 1 : 0,
  URL_LAUNCHER_WIDTH_2: parseInt(process.env.URL_LAUNCHER_WIDTH_2 || 1920, 10),
  URL_LAUNCHER_HEIGHT_2: parseInt(process.env.URL_LAUNCHER_HEIGHT_2 || 1080, 10),
  URL_LAUNCHER_TITLE_2: process.env.URL_LAUNCHER_TITLE_2 || 'Harbor Retail',
  URL_LAUNCHER_CONSOLE_2: process.env.URL_LAUNCHER_CONSOLE_2 === '1' ? 1 : 0,
  URL_LAUNCHER_URL_2: process.env.URL_LAUNCHER_URL_2 || `file:///${path.join(__dirname, 'data', 'index.html')}`,
  URL_LAUNCHER_ZOOM_2: parseFloat(process.env.URL_LAUNCHER_ZOOM_2 || 1.0),
  URL_LAUNCHER_OVERLAY_SCROLLBARS_2: process.env.URL_LAUNCHER_OVERLAY_SCROLLBARS_2 === '0' ? 1 : 0,
  ELECTRON_REMOTE_DEBUGGING: process.env.ELECTRON_REMOTE_DEBUGGING === '1' ? 1 : 0,
  ELECTRON_REMOTE_DEBUG_PORT: parseInt(process.env.ELECTRON_REMOTE_DEBUG_PORT || 9222, 10),
	ELECTRON_ROTATE_DISPLAY: process.env.DISPLAY_ROTATE,
	ELECTRON_ROTATE_DISPLAY_2: process.env.DISPLAY_ROTATE_2,
  ELECTRON_AUDIO_CONFIG: process.env.ELECTRON_AUDIO_CONFIG,
	ELECTRON_XINPUT: process.env.XINPUT_VALS,
//	ELO_TOUCH: process.env.ELO_TOUCH,
//	ELO_TOUCH_CONFIG: process.env.ELO_TOUCH_CONFIG,
};

app.commandLine.appendSwitch('--enable-features', 'CheckerImaging');
app.commandLine.appendSwitch('--use-gl', 'egl');
app.commandLine.appendArgument('--ignore-gpu-blacklist');
app.commandLine.appendSwitch('--num-raster-threads', '4');
app.commandLine.appendArgument('--enable-native-gpu-memory-buffers');
app.commandLine.appendArgument('--enable-gpu-rasterization');

// Enable and configure remote debugging
if (electronConfig.ELECTRON_REMOTE_DEBUGGING) {
  app.commandLine.appendSwitch('--remote-debugging-port', electronConfig.ELECTRON_REMOTE_DEBUG_PORT);
}

// Enable / disable hardware acceleration
if (!electronConfig.ELECTRON_ENABLE_HW_ACCELERATION) {
  app.disableHardwareAcceleration();
}

// Configure ALSA output used for browser
if (electronConfig.ELECTRON_AUDIO_CONFIG) {
  app.commandLine.appendSwitch('--alsa-output-device', electronConfig.ELECTRON_AUDIO_CONFIG);
}

// enable touch events if your device supports them
if (electronConfig.URL_LAUNCHER_TOUCH) {
  app.commandLine.appendSwitch('--touch-devices');
}
// simulate touch events - might be useful for touchscreen with partial driver support
if (electronConfig.URL_LAUNCHER_TOUCH_SIMULATE) {
  app.commandLine.appendSwitch('--simulate-touch-screen-with-mouse');
}

// Override the appData directory
// See https://electronjs.org/docs/api/app#appgetpathname
if (electronConfig.ELECTRON_APP_DATA_DIR) {
  electron.app.setPath('appData', electronConfig.ELECTRON_APP_DATA_DIR)
}

// Override the userData directory
// NOTE: `userData` defaults to the `appData` directory appended with the app's name
if (electronConfig.ELECTRON_USER_DATA_DIR) {
  electron.app.setPath('userData', electronConfig.ELECTRON_USER_DATA_DIR)
}

if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode');
  Object.assign(electronConfig, {
    URL_LAUNCHER_HEIGHT: 1080,
    URL_LAUNCHER_WIDTH: 1920,
    URL_LAUNCHER_KIOSK: 1,
    URL_LAUNCHER_CONSOLE: 1,
    URL_LAUNCHER_FRAME: 0,
    ELECTRON_REMOTE_DEBUGGING: 0,
  });
  if(electronConfig.ELECTRON_MULTI_DISPLAY) {
    Object.assign(electronConfig, {
    	URL_LAUNCHER_HEIGHT_2: 1080,
    	URL_LAUNCHER_WIDTH_2: 1920,
    	URL_LAUNCHER_KIOSK_2: 1,
    	URL_LAUNCHER_CONSOLE_2: 1,
    	URL_LAUNCHER_FRAME_2: 0,
    	ELECTRON_REMOTE_DEBUGGING: 0,
    })
  }
}

// Listen for a 'resin-update-lock' to either enable, disable or check
// the update lock from the renderer process (i.e. the app)
if (electronConfig.ELECTRON_RESIN_UPDATE_LOCK) {
  const lockFile = require('lockfile');
  electron.ipcMain.on('resin-update-lock', (event, command) => {
    switch (command) {
      case 'lock':
        lockFile.lock('/tmp/resin/resin-updates.lock', (error) => {
          event.sender.send('resin-update-lock', error);
        });
        break;
      case 'unlock':
        lockFile.unlock('/tmp/resin/resin-updates.lock', (error) => {
          event.sender.send('resin-update-lock', error);
        });
        break;
      case 'check':
        lockFile.check('/tmp/resin/resin-updates.lock', (error, isLocked) => {
          event.sender.send('resin-update-lock', error, isLocked);
        });
        break;
      default:
        event.sender.send('resin-update-lock', new Error(`Unknown command "${command}"`));
        break;
    }
  });
}

if(electronConfig.ELO_TOUCH) {
	exec("sed 's/xwarppointer/xwarppointer --activetoucharea " + electronConfig.ELO_TOUCH_CONFIG + "/g' /etc/opt/elo-usb/loadEloTouchUSB.sh", (err, stdout, stderr) => {
		if (err) {
			console.error(err);
			return;
		}
		console.log(stdout);
	});
	exec("sh /etc/opt/elo-usb/loadEloTouchUSB.sh", (err, stdout, stderr) => {
		if (err) {
			console.error(err);
			return;
		}
		console.log(stdout);
	});
};

/*
 we initialize our application display as a callback of the electronJS "ready" event
 */
app.on('ready', () => {

	if(electronConfig.ELECTRON_ROTATE_DISPLAY) {
		exec(electronConfig.ELECTRON_ROTATE_DISPLAY, (err, stdout, stderr) => {
			if (err) {
				console.error(err);
				return;
			}
			console.log(stdout);
		});
	};
  // here we actually configure the behavour of electronJS
  mainWindow = new BrowserWindow({
    width: electronConfig.URL_LAUNCHER_WIDTH,
    height: electronConfig.URL_LAUNCHER_HEIGHT,
    frame: !!(electronConfig.URL_LAUNCHER_FRAME),
    title: electronConfig.URL_LAUNCHER_TITLE,
    kiosk: !!(electronConfig.URL_LAUNCHER_KIOSK),
	  x: 0,
	  y: 0,
    webPreferences: {
      sandbox: false,
      nodeIntegration: !!(electronConfig.URL_LAUNCHER_NODE),
      zoomFactor: electronConfig.URL_LAUNCHER_ZOOM,
      overlayScrollbars: !!(electronConfig.URL_LAUNCHER_OVERLAY_SCROLLBARS),
    },
  });

  mainWindow.webContents.on('did-finish-load', () => {
    setTimeout(() => {
      mainWindow.show();
      console.log('first window launched');
    }, 300);
  });

  // if the env-var is set to true,
  // a portion of the screen will be dedicated to the chrome-dev-tools
  if (electronConfig.URL_LAUNCHER_CONSOLE) {
    mainWindow.webContents.openDevTools();
  }

  process.on('uncaughtException', (err) => {
    console.log(err);
  });

  // the big red button, here we go
  let wanTest = false;
  var timeOut = null;

  function wanChk() {
    wanT.resolve('www.google.com', function(err) {
      if(err) {
        console.log("Target URL cannot be loaded");
        wanTest = false;
        timeOut = setTimeout(function() { wanChk(); }, 10000);
      } else {
        clearTimeout(timeOut);
        wanTest = true;
        startup();
      }
    });
  };

  function startup() {
    if(wanTest) {
      console.log('displaying URL 1');
      mainWindow.loadURL(electronConfig.URL_LAUNCHER_URL);
      if(electronConfig.ELECTRON_MULTI_DISPLAY) {
        console.log('displaying URL 2');
        secondWindow.loadURL(electronConfig.URL_LAUNCHER_URL_2);
      };
    } else {
      wanChk();
    };
  };

  startup();

	if(electronConfig.ELECTRON_ROTATE_DISPLAY_2) {
		exec(electronConfig.ELECTRON_ROTATE_DISPLAY_2, (err, stdout, stderr) => {
			if (err) {
				console.error(err);
				return;
			}
			console.log(stdout);
		});
	};

	if(electronConfig.ELECTRON_XINPUT) {
		exec(electronConfig.ELECTRON_XINPUT, (err, stdout, stderr) => {
			if (err) {
				console.error(err);
				return;
			}
			console.log(stdout);
		});
	};

	if(electronConfig.ELECTRON_MULTI_DISPLAY) {

	// here we actually configure the behavour of electronJS
		secondWindow = new BrowserWindow({
			width: electronConfig.URL_LAUNCHER_WIDTH_2,
			height: electronConfig.URL_LAUNCHER_HEIGHT_2,
			frame: !!(electronConfig.URL_LAUNCHER_FRAME_2),
			title: electronConfig.URL_LAUNCHER_TITLE_2,
			kiosk: !!(electronConfig.URL_LAUNCHER_KIOSK_2),
			x: electronConfig.URL_LAUNCHER_WIDTH,
			y: 0,
			webPreferences: {
		sandbox: false,
		zoomFactor: electronConfig.URL_LAUNCHER_ZOOM_2,
		overlayScrollbars: !!(electronConfig.URL_LAUNCHER_OVERLAY_SCROLLBARS_2),
			},
		});

		secondWindow.webContents.on('did-finish-load', () => {
			setTimeout(() => {
        secondWindow.show();
        console.log('second window launched');
			}, 300);
		});

		// if the env-var is set to true,
		// a portion of the screen will be dedicated to the chrome-dev-tools
		if (electronConfig.URL_LAUNCHER_CONSOLE_2) {
			secondWindow.webContents.openDevTools();
		}

		process.on('uncaughtException', (err) => {
			console.log(err);
		});

    // second window launches as a part of the WAN check above
	};
});
