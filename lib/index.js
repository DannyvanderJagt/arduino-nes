/**
 * NES Controller Library.
 * This library can be used for communicating with the arduino and the orginal NES controllers.
 * The NES controllers must be wired according to the manual of this library. (See readme.md)
 *
 * This library is published with the MIT license.
 *
 * Created by: Danny van der Jagt (https://github.com/DannyvanderJagt)
 */

"use strict";

// Dependencise.
var	util		= require('util'),
	events		= require('events'),
	SerialPort 	= require('serialport').SerialPort,

	// Own files.
	Controller	= require('./controller'),
	// The names of the available keys in binary order.
	Keys = ['a','b','select','start','up','down','left','right'];

// The module.
var Nes = module.exports = function(opts){
	if(!(this instanceof Nes)){
		return new Nes(opts);
	}

	// Call the EventEmitter Constructor.
	events.EventEmitter.call(this);

	if(!opts){
		throw new Error('You must fill in the options!');
	}

	// Filter the options.
	if(!opts.serial){
		throw new Error('You must enter a valid serial port for your arduino!');
	}
	if(typeof opts.serial !== 'string'){
		throw new Error('You must enter a valid serial port for your arduino!');
	}

	if(opts.listen !== undefined && typeof opts.listen !== 'boolean'){
		throw new Error('You must enter a boolean for the listen option!');
	}

	if(!opts.controllers){
		throw new Error('You must add atleast 1 controller!');
	}

	if(!util.isArray(opts.controllers)){
		throw new Error('The controller option has the be an Array with objects inside! See docs at github!');
	}

	if(opts.controllers.length <= 0){
		throw new Error('You must add atleast 1 controller!');
	}

	// Vars.
	this.controllers = opts.controllers;
	this.numberOfControllers = this.controllers.length;
	this.listen = opts.listen !== undefined ? opts.listen : true;
	this.serial = opts.serial;

	this._receivedData = ""; // 4 temp vars for storage - see Nes.onData
	this._receivedCommand = ""; 
	this._b = 0; // The position of the begin charachter (B) within the _receivedData string.
	this._e = 0; // The position of the end charachter (E) within the _receivedData string.

	this.arduino; // See Nes.connect!
	this.controller = []; // Array with the controllers.

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
/**
 * The open event handler. Will be fired when the connection with is arduino is successfully established.
 * @return {[type]} [description]
 */
Nes.prototype._onOpen = function(){
	this.emit('connected');
	this.arduino.flush(function(){
		// Start listening!
		if(this.listen){
			this.startListening();
		}
	}.bind(this));
	return this;
}

/**
 * The ready event handler. Will be fired when this library receives the ready event from the arduino.
 * @return {[type]} [description]
 */
Nes.prototype._onReady = function(){
	this.emit('ready');
	return this;
}

/**
 * Collect and send the settings to the arduino.
 * @return {[type]} [description]
 */
Nes.prototype._onSettings = function(){
	var data = '';

	for(var i = 0; i < this.controllers.length; i++){
		data += '[' +
			this.controllers[i].clock + ',' +
			this.controllers[i].latch + ',' +
			this.controllers[i].data  +
		']';
	}
	console.log(data);
	this.arduino.write(data);
	return this;
}

/**
 * The error event handler. Will be fired when the arduino emits an error!
 * @param  {[type]} error [description]
 * @return {[type]}       [description]
 */
Nes.prototype._onError = function(error){
	this.emit('error', error);
	return this;
}

/**
 * The disconnect event handler. Will be fired when the the arduino is disconnected from this library.
 * @return {[type]} [description]
 */
Nes.prototype._onDisconnect = function(){
	this.emit('disconnect');
	return this;
}

/**
 * The close event handler. Will be fired when the connection with the arduino is closed.
 * @return {[type]} [description]
 */
Nes.prototype._onClose = function(){
	this.emit('disconnect');
	return this;
}

/**
 * Convert the data from the arduino's data event into key events for the controllers.
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
Nes.prototype._onData = function(data){
	this._receivedData += data.toString();
	this._b = this._receivedData.indexOf('B');
	this._e = this._receivedData.indexOf('E');

	if(this._e >= 0 && this._b >= 0){
		this._receivedCommand = this._receivedData.substring(this._receivedData.indexOf('B') + 1, this._receivedData.indexOf('E'));
		this._receivedData = this._receivedData.substr(this._e+1);

		if(this._receivedCommand === 'settings'){
			this._onSettings();
		}else if(this._receivedCommand === 'ready'){
			this._onReady();
		}else{
			var controlNum = parseInt(this._receivedCommand[0]),
				controller = this.controller[controlNum];

			if(controller){
				var number = ("000000000" + (this._receivedCommand.substr(1) >>> 0).toString(2)).substr(-8); // Convert to Binary String.
				
				for(var i = 0; i < Keys.length; i++){
					if(number[i] == '1' && controller.states[Keys[i]] == false){
						// Pressed!
						controller._onChange(Keys[i], 'press');
					}else if(number[i] == 0 && controller.states[Keys[i]] == true){
						// Release.
						controller._onChange(Keys[i], 'release');
					}

				}
			}
		}
	}
	return this;
}

/**
 * Start listening to the data event of the arduino.
 * @return {[type]} [description]
 */
Nes.prototype._listen = function(){
	if(this.arduino.paused){
		throw new Error('You can only listen for events when the arduino is sucessfull connected!');
	}
	this.emit('startedListening');
	this.listen = true;
	this.arduino.on('data', this._onData.bind(this));
	return this;
}

// Public.
/**
 * Connect this library to the arduino.
 */
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
	this.arduino
		.on('open', this._onOpen.bind(this))
		.on('error', this._onError.bind(this))
		.on('close', this._onClose.bind(this));

	return this;
}

/**
 * Start listening to the controllers.
 */
Nes.prototype.startListening = function(){
	this._listen();
	return this;
}

/**
 * Stop listening to the contollers.
 */
Nes.prototype.stopListening = function(){
	this.listen = false;
	this.arduino.removeAllListeners('data', this._onData.bind(this));
	this.emit('stoppedListening');
	return this;
}

/**
 * Return if we are listening.
 * @return {Boolean} true if we are listening and false if we don't.
 */
Nes.prototype.isListening = function(){
	return this.listen;
}

/**
 * Disconnect this library from the arduino.
 */
Nes.prototype.disconnect = function(){
	this.arduino.close();
	return this;
}