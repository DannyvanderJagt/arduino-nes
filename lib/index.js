// Nes Controller Library.
"use strict";

// Dependencise.
var	util		= require('util'),
	events		= require('events'),
	SerialPort 	= require('serialport').SerialPort,

	Controller	= require('./controller');

var Keys = ['b','a','select','start','up','down','left','right'];

// Module.
var Nes = function(opts){
	if(!(this instanceof Nes)){
		return new Nes(opts);
	}

	// Call the EventEmitter Constructor.
	events.EventEmitter.call(this);

	// Filter the options.
	if(typeof opts.serial !== 'string'){
		throw new Error('You must enter a valid serial port for your arduino!');
	}

	if(opts.listen !== undefined && typeof opts.listen !== 'boolean'){
		throw new Error('You must enter a boolean for the listen option!');
	}

	if(opts.listen !== undefined && typeof opts.listen !== 'number'){
		throw new Error('You must enter a number for the number of controllers!');
	}

	// Vars.
	this.numberOfControllers = opts.controllers || 2;
	this.listen = opts.listen !== undefined ? opts.listen : true;
	this.serial = opts.serial;

	this._receivedData = ""; // 4 temp vars for storage - see Nes.onData
	this._receivedCommand = ""; 
	this._b = 0;
	this._e = 0;

	this.arduino; // See Nes.connect!
	this.controller = [];

	// Create the controllers.
	for(var i = 0; i < this.numberOfControllers; i++){
		this.controller.push(new Controller(i));
	}
	
	// Create the connection with the arduino!
	this.connect();
}

// Inherit the EventEmitter.
util.inherits(Nes, events.EventEmitter);

// Private!
Nes.prototype._onOpen = function(){
	this.emit('connected');

	// Start listening!
	if(this.listen){
		this.startListening();
	}
}

Nes.prototype._onReady = function(){
	this.emit('ready');
}

Nes.prototype._onError = function(error){
	this.emit('error', error);
}

Nes.prototype._onDisconnect = function(){
	this.emit('disconnect');
}

Nes.prototype._onClose = function(){
	this.emit('disconnect');
}

Nes.prototype._onData = function(data){
	this._receivedData += data.toString();
	this._b = this._receivedData.indexOf('B');
	this._e = this._receivedData.indexOf('E');

	if(this._e >= 0 && this._b >= 0){
		this._receivedCommand = this._receivedData.substring(this._receivedData.indexOf('B') + 1, this._receivedData.indexOf('E'));
		this._receivedData = this._receivedData.substr(this._e+1);

		if(this._receivedCommand === 'ready'){
			this._onReady();
		}else{
			// Process the number to binary etc.
			if(this.controller[parseInt(this._receivedCommand[0])]){
				var number = ("000000000" + (this._receivedCommand.substr(1) >>> 0).toString(2)).substr(-8); // Convert to Binary String.
				for(var i = 0; i < Keys.length; i++){
					if(number[i] == '1'){
						this.controller[parseInt(this._receivedCommand[0])]._onChange(Keys[i]);
					}
				}
			}
		}
	}
}

Nes.prototype._convert = function(number){
	number = ("000000000" + (number >>> 0).toString(2)).substr(-8); // Convert to Binary String.
	for(var i = 0; i < Keys.length; i++){
		if(number[i] == '1'){

		}
		console.log(number, i, number[i] == "1", Keys[i]);
	}
}

Nes.prototype._listen = function(){
	if(this.arduino.paused){
		throw new Error('You can only listen for events when the arduino is sucessfull connected!');
	}
	this.listen = true;
	this.arduino.on('data', this._onData.bind(this));
}

// Public.
Nes.prototype.connect = function(){
	if(this.arduino){
		throw new Error('We are already connected to the arduino!');
	}

	// Connect to the arduino!
	this.arduino = new SerialPort(this.serial,{
		baudrate: 9600,
		dataBits: 8,
		parity: 'none',
		stopBits: 1,
		flowControl: false,
		disconnectedCallback: this._onDisconnect.bind(this),
	});

	// Use the events!
	this.arduino.on('open', this._onOpen.bind(this));
	this.arduino.on('error', this._onError.bind(this));
	this.arduino.on('close', this._onClose.bind(this));
}

Nes.prototype.startListening = function(){
	this._listen();
}

Nes.prototype.stopListening = function(){
	this.listen = false;
	// TODO: destroy the event listeners.
	this.arduino.removeAllListeners('data', this._onData.bind(this));
}

Nes.prototype.isListening = function(){
	return this.listen;
}

Nes.prototype.disconnect = function(){
	this.arduino.close();
}

module.exports = Nes;