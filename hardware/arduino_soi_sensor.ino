int moisturePin = A0;
int phPin = A1;
int ecPin = A2;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int moisture = analogRead(moisturePin);
  int ph = analogRead(phPin);
  int ec = analogRead(ecPin);
  Serial.print(moisture);
  Serial.print(",");
  Serial.print(ph);
  Serial.print(",");
  Serial.println(ec);
  delay(2000);
}
