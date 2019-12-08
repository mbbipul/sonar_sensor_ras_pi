var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const Gpio = require('pigpio').Gpio;
 
const MICROSECDONDS_PER_CM = 1e6/34321;
 
const trigger = new Gpio(23, {mode: Gpio.OUTPUT});
const echo = new Gpio(24, {mode: Gpio.INPUT, alert: true});

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res,next) {
	res.sendFile(__dirname + 'public/index.html');
});

server.listen(8080);
server.on('listening', function(){
	console.log('https://localhost:8080');
});

io.sockets.on('connection', function (socket) {// WebSocket Connection
   
	trigger.digitalWrite(0); 
	 
	const watchHCSR04 = () => {
	  let startTick;
	 
	  echo.on('alert', (level, tick) => {
		if (level == 1) {
		  startTick = tick;
		} else {
		  const endTick = tick;
		  const diff = (endTick >> 0) - (startTick >> 0); 
		  socket.emit('distance',diff / 2 / MICROSECDONDS_PER_CM);
		}
	  });
	};
	 
	watchHCSR04();
	 
	// Trigger a distance measurement once per second
	setInterval(() => {
	  trigger.trigger(10, 1); // Set trigger high for 10 microseconds
	}, 1000);


  socket.on('light', function(data) { //get light switch status from client
    lightvalue = data;
    if (lightvalue != LED.readSync()) { //only change LED if status has changed
      LED.writeSync(lightvalue); //turn LED on or off
    }
  });
});

