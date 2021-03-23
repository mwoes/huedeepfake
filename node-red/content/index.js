  var five = require('johnny-five');
  var pixel = require('node-pixel');
  var express = require('express');
  var app = require('express')();
  var server = require('http').Server(app);
  var io = require('socket.io')(server);
  var sleep = require('system-sleep');
  var board = new five.Board({
    port: '/dev/ttyACM0'
  });
  var strip = null;
  var blinker;
  var transition = false;
  var color = [0, 0, 0];
  var i = 0;
  var lightOn = false;

  app.use(express.static(__dirname))

  server.listen(3000, "0.0.0.0", function () {
    console.log(`HarborNode listening at http://localhost:${server.address().port}`)
  });

  board.on('ready', function() {
    strip = new pixel.Strip({
      data: 6,
      length: 12,
      color_order: pixel.COLOR_ORDER.GRB,
      board: this,
      controller: 'FIRMATA',
    });

    strip.on('ready', function() {
      strip.off();
      });

function turnOnHue(rgb) {
  color = rgb;
  console.log("turn on hue function " + color);
  while (color[0] < 255 || color[1] < 255 || color[2] < 255) {
    color = rgb;
    console.log(color);
    if (color[0] < 255) { color[0]++; };
    if (color[1] < 255) { color[1]++; };
    if (color[2] < 255) { color[2]++; };
    if (isEven(i)) {
      strip.color(color);
      strip.show();
    };
    i++;
  };
  color = [255, 255, 255];
  transition = false;
};
    
function turnOffHue(rgb) {
  color = rgb;
  console.log("turn off hue function " + color);
  while ((color[0] + color[1] + color[2]) != 0) {
    console.log(color);
    if (color[0] >= 1) { color[0] = Math.floor(color[0]*0.75); };
    if (color[1] >= 1) { color[1] = Math.floor(color[1]*0.75); };
    if (color[2] >= 1) { color[2] = Math.floor(color[2]*0.75); };
    strip.color(color);
    strip.show();
    sleep(20);
  };
  color = [0, 0, 0];
  strip.color(color);
  strip.show();
  transition = false;
};
    
function isEven(value){
    if (value%2 == 0)
        return true;
    else
        return false;
}
    
io.on('connection', function (socket) {
  socket.on('command', function (data) {
      console.log("Sending RGB: " + data + " is being sent to the light");
      socket.emit('return', "Sending RGB: " + data + " is being sent to the light");
      clearTimeout(blinker);
      if (!transition) {
        strip.color(data);
        strip.show();
      };
  });
  socket.on('commandHEX', function (data) {
      console.log("Sending HEX: " + data + " is being sent to the light");
      socket.emit('return', "Sending HEX: " + data + " is being sent to the light");
      clearTimeout(blinker);
      if (!transition) {
        strip.color(data);
        strip.show();
      };
  });
  socket.on('commandPWR', function (data) {
      console.log(data);
      rgb = data[1]
      if (data[0] == 1) {
        console.log("on, " + rgb);
        lightOn = true;
        socket.emit('power', lightOn);
        i = 1;
        if (!transition) {
          transition = true;
          turnOnHue([0, 0, 0]);
        };
      };
      if (data[0] == 0) {
        console.log("off, " + rgb);
        lightOn = false;
        socket.emit('power', lightOn);
        i = 1;
        if (!transition) {
          transition = true;
          turnOffHue(rgb);
        };
      };
  });
});
    
 app.get('/', function(req, res) {
      res.sendFile('/index.html');
      });
 app.get('/admin', function(req, res) {
      res.sendFile(__dirname + '/admin.html');
      });

 app.get('/red', function(req, res) {
    clearTimeout(blinker);
    strip.color('red');
    strip.show();
    res.redirect('/admin');
  });

  app.get('/green', function(req, res) {
    clearTimeout(blinker);
    strip.color('green');
    strip.show();
    res.redirect('/admin');
  });

  app.get('/blue', function(req, res) {
    clearTimeout(blinker);
    strip.color('blue');
    strip.show();
    res.redirect('/admin');
  });

  app.get('/clear', function(req, res) {
    clearTimeout(blinker);
    strip.off();
    res.redirect('/admin');
  });

  app.get('/panel', function(req, res) {
    var colors = ['red', 'green', 'blue', "yellow", "cyan", "magenta", "white"];
    var current_colors = 0;

    blinker = setInterval(function() {
      if (++current_colors >= colors.length) current_colors = 0;
      strip.color(colors[current_colors]);
      strip.show();
    }, 1000);

    res.redirect('/admin');
  });

  app.get('/test', function(req, res) {
    clearTimeout(blinker);
    strip.color('rgba(255,127,80,0)');
    strip.show();
    res.redirect('/admin');
  });

  app.get('/breathe', function(req, res) {
    var color = 0;
    var rising = true;
    var max = 255;
    var min = 0;

    blinker = setInterval(function() {
      if (rising) {
        color++;
        if (color >= max) {
          rising = false;
          color = max;
        }
      } else {
        color--;
        if (color <= min) {
          rising = true;
          color = min;
        }
      }

      strip.color('rgba(' + color + ',' + color + ',' + color + ')');
      strip.show();
    }, 20);

    res.redirect('/');
  });
  });
