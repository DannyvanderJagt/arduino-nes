var Nes = require('./lib');

var nes = new Nes({
	serial: "/dev/tty.usbmodem1d1111"
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


nes.controller[0].on('start', function(){
	console.log('START!!!');
})