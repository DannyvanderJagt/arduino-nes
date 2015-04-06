var Nes = require('./lib');

var nes = new Nes({
	serial: "/dev/tty.usbmodem1d1111",
	controllers:[
		{
			clock: 3,
			latch: 2,
			data: 4
		},
		{
			clock: 6,
			latch: 5,
			data: 7
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


nes.controller[0].on('*', function(event){
	console.log('controller 0:', event);
})

nes.controller[1].on('*', function(event){
	console.log('controller 1:', event);
})