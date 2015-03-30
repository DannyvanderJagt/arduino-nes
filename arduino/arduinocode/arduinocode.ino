const int latch = 2;
const int clock = 3;
const int data = 4;

const int latch2 = 5;
const int clock2 = 6;
const int data2 = 7;

byte old_controller_data = 0;
byte old_controller_data2 = 0;

void setup() {
  Serial.begin(9600);
  
  pinMode(latch, OUTPUT);
  pinMode(clock, OUTPUT);
  pinMode(data, INPUT);
  
  pinMode(latch2, OUTPUT);
  pinMode(clock2, OUTPUT);
  pinMode(data2, INPUT);
  
  digitalWrite(latch,HIGH);
  digitalWrite(clock,HIGH);
  
  digitalWrite(latch2,HIGH);
  digitalWrite(clock2,HIGH);
  
  // Send the ready event!
  Serial.print("B");
  Serial.print("ready");
  Serial.print("E");
}

byte controllerRead() {
  byte controller_data = 0;
  digitalWrite(latch,LOW);
  digitalWrite(clock,LOW);
  
  digitalWrite(latch,HIGH);
  delayMicroseconds(2);
  digitalWrite(latch,LOW);
  
  controller_data = digitalRead(data);
 
  for (int i = 1; i <= 7; i++) {
    digitalWrite(clock, HIGH);
    delayMicroseconds(2);
    controller_data = controller_data << 1;
    controller_data = controller_data + digitalRead(data);
    delayMicroseconds(4);
    digitalWrite(clock, LOW);
  }

 return 255 - controller_data;
}


byte controllerRead2() {
  byte controller_data2 = 0;
  digitalWrite(latch2,LOW);
  digitalWrite(clock2,LOW);
  
  digitalWrite(latch2,HIGH);
  delayMicroseconds(2);
  digitalWrite(latch2,LOW);
  
  controller_data2 = digitalRead(data2);
 
  for (int i = 1; i <= 7; i++) {
    digitalWrite(clock2, HIGH);
    delayMicroseconds(2);
    controller_data2 = controller_data2 << 1;
    controller_data2 = controller_data2 + digitalRead(data2);
    delayMicroseconds(4);
    digitalWrite(clock2, LOW);
  }

 return 255 - controller_data2;
}

void loop() {
  byte controller_data = controllerRead();
  byte controller_data2 = controllerRead2();
  
  if(controller_data != old_controller_data){
    Serial.print("B0");
    Serial.print(controller_data);
    Serial.print("E");
  }
  if(controller_data2 != old_controller_data2){
    Serial.print("B1");
    Serial.print(controller_data2);
    Serial.print("E");
  } 

  old_controller_data = controller_data;
  old_controller_data2 = controller_data2;
  
  delay(20); // Give both sides some time to do its thing.
}
