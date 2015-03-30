const int latch = 2;
const int clock = 3;
const int data = 4;

const int latch2 = 5;
const int clock2 = 6;
const int data2 = 7;

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
}

byte controllerRead() {
  byte controller_data = 0;
  byte controller_data2 = 0;
  digitalWrite(latch,LOW);
  digitalWrite(clock,LOW);
  
  digitalWrite(latch2,LOW);
  digitalWrite(clock2,LOW);
  
  digitalWrite(latch,HIGH);
  digitalWrite(latch2,HIGH);
  delayMicroseconds(2);
  digitalWrite(latch,LOW);
  digitalWrite(latch2,LOW);
  
  controller_data = digitalRead(data);
  controller_data2 = digitalRead(data2);
 
  for (int i = 1; i <= 7; i++) {
    digitalWrite(clock, HIGH);
    digitalWrite(clock2, HIGH);
    delayMicroseconds(2);
    controller_data = controller_data << 1;
    controller_data2 = controller_data2 << 1;
    controller_data = controller_data + digitalRead(data);
    controller_data2 = controller_data2 + digitalRead(data2);
    delayMicroseconds(4);
    digitalWrite(clock, LOW);
    digitalWrite(clock2, LOW);
  }

 Serial.println(255 - controller_data);
  Serial.println(255 - controller_data2);
 return 255 - controller_data;
}

void loop() {
  byte controller_data = controllerRead();
  
//  Serial.print("B");
//  Serial.print(controller_data);
//  Serial.print("E");
  delay(20); // Give both sides some time to do its thing.
}
