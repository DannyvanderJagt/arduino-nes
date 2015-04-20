var Nes = require('arduino-nes');

var nes = new Nes({
	serial: "/dev/tty.usbmodem1d1131", // Make sure this is set to your port!
	controllers:[
		{
			clock: 2,
			latch: 3,
			data: 4
		}
	]
});

nes.on('error', function(){
	console.log('error', arguments);
}).on('ready', function(){
	console.log('ready', arguments);
}).on('connected', function(){
	console.log('connected', arguments);
}).on('disconnect', function(){
	console.log('disconnect', arguments);
});

// Listen for all event from the first controller.
Nes.controllers[0].on('*', function(event){
	console.log('Controller 1: You just fired the ' + event + ' event');
	// Do something.
});