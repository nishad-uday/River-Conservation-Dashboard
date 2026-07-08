import serial
import time

def read_moisture():
    try:
        import serial, time
        arduino = serial.Serial('COM4', 9600, timeout=2)
        time.sleep(1)
        arduino.write(b'R')  # Arduino को command भेजना
        value = arduino.readline().decode().strip()  # Arduino से reading लेना
        arduino.close()
        return float(value)
    except Exception as e:
        print("Error:", e)
        return None

