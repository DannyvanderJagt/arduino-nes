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

// Depedencies.
var	util		= require('util'),
	events		= require('events');

// Module.
var Controller = module.exports = function(id){
	if(!(this instanceof Controller)){
		return new Controller(id);
	}

	// Call the EventEmitter Constructor.
	events.EventEmitter.call(this);

	// Vars.
	this.id = id;
	this.states = {
		right: false,
		left: false,
		down: false,
		up: false,
		start: false,
		select: false,
		a: false,
		b: false
	};

	return this;
};

// Inherit the EventEmitter.
util.inherits(Controller, events.EventEmitter);

// Private.
/**
 * Store the current state of the button and emit an event to the outside world!
 * @param  {[type]} key   [description]
 * @param  {[type]} state [description]
 * @return {[type]}       [description]
 */
Controller.prototype._onChange = function(key, state){
	this.states[key] = (state == 'press' ? true : false);
	if(state === 'release'){
		key = key+'Release';
	}
	this.emit(key);
	this.emit('*', key);
}

// Public.

/**
 * Return the list with states of the buttons.
 * @return {[type]} [description]
 */
Controller.prototype.getStates = function(){
	return this.states;
}