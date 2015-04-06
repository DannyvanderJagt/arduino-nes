/*
  This is a part of the arduino-nes library.
  The library can be found at: https://github.com/DannyvanderJagt/arduino-nes
  
  This is published with the MIT license.
  Created by: Danny van der Jagt.
*/

// Variables.
int numberOfControllers = 0;
int controller[2][3] = {}; // Ports: clock, latch, data. //{6,5,7},{3,2,4}
byte* data = 0;
byte* oldData = 0;
boolean wait = true; // Wait for the settings.
String nodeString = ""; // Store temporary the message from the node library.

void setup() {
  Serial.begin(9600);  
//  Serial.flush();
  
  // Send the settings event!
  Serial.print("B");
  Serial.print("settings");
  Serial.print("E");
}

void loop() {
  if(wait){
    
      nodeString = Serial.readString();
      numberOfControllers = nodeString.length()/7;
      
      // Get the ports for each controller.
      for(int i = 0; i < numberOfControllers; i++){
        String stringArr = nodeString.substring(i*7, (i+1)*7);
        controller[i][0] = ((String)stringArr.charAt(1)).toInt(); // Clock pin.
        controller[i][1] = ((String)stringArr.charAt(3)).toInt(); // Latch pin.
        controller[i][2] = ((String)stringArr.charAt(5)).toInt(); // Data pin.
      }
     
      setup_controllers();
      
      // Send the ready event!
      Serial.print("B");
      Serial.print("ready");
      Serial.print("E");
      
      // Start reading the data from the controllers.
      wait = false;
    
      delay(100);
  }else{
    for(int i = 0; i < numberOfControllers; i++){
       data[i] = read_controller(i);
    }
    
    for(int i = 0; i < numberOfControllers; i++){
       if(data[i] != oldData[i]){
         Serial.print("B");
         Serial.print(i);
         Serial.print(data[i]);
         Serial.print("E");
         oldData[i] = data[i];
       }
    }
    
    delay(20); // Give both sides some time to do its thing.
  }
}

// Setup the ports for the controllers.
void setup_controllers(){
  oldData = new byte[2];
  data = new byte[2];
  
  for(int i = 0; i < numberOfControllers; i++){
      oldData[i] = 0;
      data[i] = 0;
      
      pinMode(controller[i][0], OUTPUT);
      pinMode(controller[i][1], OUTPUT);
      pinMode(controller[i][2], INPUT);
      
      digitalWrite(controller[i][0],HIGH);
      digitalWrite(controller[i][1],HIGH);
  }
}

byte read_controller(int id) {
  byte data = 0;
  
  digitalWrite(controller[id][1],LOW); // Latch
  digitalWrite(controller[id][0],LOW); // Clock

  digitalWrite(controller[id][1],HIGH); // Latch
  delayMicroseconds(2);
  digitalWrite(controller[id][1],LOW); // Latch
  
  data = digitalRead(controller[id][2]); // Data
 
  for (int i = 1; i <= 7; i++) {
    digitalWrite(controller[id][0], HIGH); // Clock
    delayMicroseconds(2);
    data = data << 1;
    data = data + digitalRead(controller[id][2]); // Data
    delayMicroseconds(4);
    digitalWrite(controller[id][0], LOW); // Clock
  }

 return 255 - data;
}
