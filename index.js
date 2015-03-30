var NesController = require('./nes-controller');

var controller = new NesController({
  start: true, // Default: true,
  serial: "/dev/tty.usbmodem1d1111" // Required!
});

controller.on('ready', function(){
  console.log('ready');
})

controller.on('start', function(){
  console.log('start');
})
controller.on('stop', function(){
  console.log('stop');
})

controller.on('data', function(controller1, controller2){
  console.log('data', controller1, controller2);
})

// nes.c


// setTimeout(function(){
//   controller.stop();
// },2000);

// var SerialPort = require('serialport').SerialPort;

// var receivedData = "";

// var serialPort = new SerialPort("/dev/tty.usbmodem1d1111",{
//   baudrate: 9600,
//   dataBits: 8,
//   partiy: 'none',
//   stopBits: 1,
//   flowControl:false
// });

// var on = false;
// var sendData = "";


// serialPort.on("open", function(){
//   serialPort.on('data', function(data){
//       receivedData += data.toString();
//       if (receivedData .indexOf('E') >= 0 && receivedData .indexOf('B') >= 0) {
//          // save the data between 'B' and 'E'
//          sendData = receivedData .substring(receivedData .indexOf('B') + 1, receivedData .indexOf('E'));
//          receivedData = '';
//          sendData = sendData.split(':');
//          console.log('senddata', sendData, (sendData[0] >>> 0).toString(2),(sendData[1] >>> 0).toString(2));

//       }
//   })
// })