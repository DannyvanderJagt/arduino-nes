"use strict";

// Depedencies.
var	util		= require('util'),
	events		= require('events');

// Module.
var Controller = function(id){
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
Controller.prototype._onChange = function(key){
	if(this.states[key]){
		this.states[key] = value;
	}
	this.emit(key);
}

// Public.
Controller.prototype.getStates = function(){
	return this.states;
}

module.exports = Controller;