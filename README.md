# Arduino Nes
A Library for connecting the serial/original nes controllers to an Arduino and node js.

## Api.
Constructor options:

* `serial`: (required)
* `listen`: false (default: true)
* `controllers`: 2 (default is 1)

### Functions
* `startListening` (all controllers)
* `stopListening`  (all controllers)
* `isListening` - boolean
* `disconnect(callback(err))`

### Events.
* `connected`
* `disconnected`
* `error(err)`
* `ready` (the controllers are ready to use!)
* `startListening` (all controllers)
* `stopListening` (all controllers)

### Controllers
* `getStates`

#### Events.
* `down`
* `up`
* `left`
* `right`
* `select`
* `start`
* `a`
* `b`

### Example

```js

var ArduinoNes = require('arduino-nes');
var Nes = new ArduinoNes({
	serial: "/dev/tty.usbmodem1d1111",
	numberOfControllers: 1, // or 2
});

// When the down button is pressed!
Nes.controllers[0].on('down', function(){
	// Do something.
});

// When the down button is released.
Nes.controllers[0].on('downReleased', function(){
	// Do something.
});

// Get all the buttons states.
var states = Nes.controllers[0].getStates();
/*
{
	left: false,
	right: false,
	down: true',
	up: false,
	start: false,
	select: false,
	a: false,
	b: true
}
*/

```

### Todos:
* Added the release key event!
* Comment the code.
* Clean up the code node and arduino.
* Refactor the arduino code.