// =====================================================
// STOPLEAK - MÓDULO 1: LEITURA E CALIBRAÇÃO DO SENSOR
// Branch: feat/firmware-sensor-vazao
// =====================================================

#include <Arduino.h>

#define SENSOR_PIN1 17

volatile unsigned long pulsos = 0;
unsigned long ultimoCalculo = 0;
float PULSOS_POR_LITRO = 442.0;
float VAZAO_MINIMA = 0.20;
float vazao = 0.0;
float volumeTotal = 0.0;

void IRAM_ATTR contarPulso() {
  pulsos++;
}

void calibrarSensor() {
  Serial.println("\n========================================");
  Serial.println("        CALIBRACAO DO YF-S201");
  Serial.println("========================================");
  Serial.println("Digite o volume conhecido em litros (ex: 1):");

  while (Serial.available() == 0) delay(10);
  float volumeConhecido = Serial.parseFloat();

  if (volumeConhecido <= 0) {
    Serial.println("Volume invalido.");
    return;
  }

  while (Serial.available()) Serial.read();

  noInterrupts();
  pulsos = 0;
  interrupts();

  Serial.println("Libere a agua. Digite FIM no monitor serial quando atingir o volume:");

  while (true) {
    noInterrupts();
    unsigned long pulsosAtual = pulsos;
    interrupts();

    Serial.print("\rPulsos detectados: ");
    Serial.print(pulsosAtual);

    if (Serial.available()) {
      String comando = Serial.readStringUntil('\n');
      comando.trim();
      if (comando.equalsIgnoreCase("FIM")) {
        noInterrupts();
        unsigned long pulsosFinal = pulsos;
        interrupts();

        if (pulsosFinal > 0) {
          PULSOS_POR_LITRO = pulsosFinal / volumeConhecido;
          Serial.println("\n\n========================================");
          Serial.println("CALIBRACAO CONCLUIDA");
          Serial.print("Novo valor: ");
          Serial.print(PULSOS_POR_LITRO, 2);
          Serial.println(" pulsos/L");
          Serial.println("========================================");
        } else {
          Serial.println("\nNenhum pulso foi detectado.");
        }
        break;
      }
    }
    delay(500);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(SENSOR_PIN1, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(SENSOR_PIN1), contarPulso, RISING);
  Serial.println(">>> Sensor YF-S201 Inicializado.");
}

void loop() {
  unsigned long agora = millis();

  if (Serial.available()) {
    String comando = Serial.readStringUntil('\n');
    comando.trim();
    if (comando.equalsIgnoreCase("CALIBRAR")) {
      calibrarSensor();
    }
  }

  if (agora - ultimoCalculo >= 1000) {
    ultimoCalculo = agora;

    noInterrupts();
    unsigned long pulsosAtual = pulsos;
    pulsos = 0;
    interrupts();

    vazao = (pulsosAtual * 60.0) / PULSOS_POR_LITRO;
    float volumeAtual = pulsosAtual / PULSOS_POR_LITRO;
    volumeTotal += volumeAtual;

    Serial.println("----------------------------------------");
    Serial.print("Vazao: "); Serial.print(vazao, 3); Serial.println(" L/min");
    Serial.print("Volume total: "); Serial.print(volumeTotal, 3); Serial.println(" L");
  }
}