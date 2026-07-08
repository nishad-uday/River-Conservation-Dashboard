#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASS";
const char* server = "http://192.168.1.100:5000/ingest"; // change to your PC ip

int moisturePin = A0;
int phPin = A0; // placeholder if single ADC; adapt with proper sensors/ADC
int ecPin = A0;

void setup(){
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected");
}

void loop(){
  float moisture = analogRead(moisturePin) / 1023.0 * 100.0;
  float pH = analogRead(phPin) / 1023.0 * 14.0;
  float ec = analogRead(ecPin);

  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    http.begin(server);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["device_id"] = "nodeMCU_01";
    doc["pH"] = pH;
    doc["EC"] = ec;
    doc["TDS"] = ec*0.5;
    doc["Temperature"] = 25.0;
    doc["DissolvedOxygen"] = 6.0;
    doc["Moisture"] = moisture;

    String payload;
    serializeJson(doc, payload);
    int code = http.POST(payload);
    if(code>0){
      Serial.println("Posted: "+ String(code));
    } else {
      Serial.println("Post failed");
    }
    http.end();
  }
  delay(10000);
}
