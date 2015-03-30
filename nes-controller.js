// Nes Controller Library.
"use strict";

// Dependencise.
var	util		= require('util'),
	events		= require('events'),
	SerialPort 	= require('serialport').SerialPort;

// Module.
var NES = function(opts){
	if(!(this instanceof Controller)){
		return new Controller(opts);
	}

	events.EventEmitter.call(this);

	// Setup options.
	if(typeof opts.serial !== 'string'){
		throw new Error('You must enter a valid serial port for your arduino!');
	}

	this.start = opts.start !== undefined && typeof opts.start == 'boolean' ? opts.start : true;
	this.receivedData = "";
	this.sendData = "";

	// Create the connection with the arduino!
	this.serialport = new SerialPort(opts.serial,{
		baudrate: 9600,
		dataBits: 8,
		parity: 'none',
		stopBits: 1,
		flowControl: false
	});

	this.serialport.on('open', this._onOpen.bind(this));

	if(this.start){
		this.serialport.on('data', this._onData.bind(this));
	}
}

// Inherit the EventEmitter.
util.inherits(Controller, events.EventEmitter);

// Private.
NES.prototype._onOpen = function(){
	this.emit('connected');
	this.emit('ready'); // TODO!
}

NES.prototype._onData = function(data){
	// console.log('data', data);
	this.receivedData += data.toString();
	if (this.receivedData .indexOf('E') >= 0 && this.receivedData .indexOf('B') >= 0) {
	 // save the data between 'B' and 'E'
	 this.sendData = this.receivedData .substring(this.receivedData .indexOf('B') + 1, this.receivedData .indexOf('E'));
	 this.receivedData = '';
	 console.log(this.sendData.slice(1), this.sendData);
	 // this.sendData = this.sendData.split(':');
	 // this._convert((this.sendData[0] >>> 0).toString(2));
	 // console.log(typeof this.sendData[0]);
	 if(this.sendData !== 'EB' && this.sendData !== undefined){
	 	this._convert(this.sendData[0], byteString(this.sendData.slice(1)));
	 	// this.emit('data',byteString(this.sendData[0]), byteString(this.sendData[1]));// (this.sendData[0] >>> 0).toString(2),(this.sendData[1] >>> 0).toString(2));
	 } 


	}
}

function byteString(n) {
  if (n < 0 || n > 255 || n % 1 !== 0) {
      throw new Error(n + " does not fit in a byte");
  }
  return ("000000000" + (n >>> 0).toString(2)).substr(-8)
}

// Convert binary to events.
NES.prototype._convert = function(controller, binary){
	// 1 // Right arrow
	// 10 // Left arrow
	// 100 // Down arrow.
	// 1000 // Up arrow.
	// 10000 // Start
	// 100000 // Select
	// 1000000 // B button
	// 10000000 // A button
	if(binary[7] === "1"){
		console.log(controller, 'right');
	}else{
		console.log(controller, 'up right');
	}
	if(binary[6] === "1"){
		console.log(controller, 'left');
	}
	if(binary[5] === "1"){
		console.log(controller, 'down');
	}
	if(binary[4] === "1"){
		console.log(controller, 'up');
	}
	if(binary[3] === "1"){
		console.log(controller, 'start');
	}
	if(binary[2] === "1"){
		console.log(controller, 'select');
	}
	if(binary[1] === "1"){
		console.log(controller, 'B-button');
	}
	if(binary[0] === "1"){
		console.log(controller, 'A-button');
	}
}

// Public
NES.prototype.start = function(){
	this.start = true;
	this.serialport.on('data', this._onData.bind(this));
	this.emit('start');
}

NES.prototype.stop = function(){
	this.start = false;
	this.serialport.removeAllListeners('data', this._onData.bind(this));
	this.emit('stop');
}



module.exports = NES;