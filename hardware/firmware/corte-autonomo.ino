// =====================================================
// STOPLEAK - MÓDULO 2: CORTE AUTÔNOMO E SERVIDOR WEB AP
// Branch: feat/firmware-corte-autonomo
// =====================================================

#include <WiFi.h>
#include <WiFiAP.h>
#include <WiFiClient.h>

#define SENSOR_PIN1 17
#define VALVULA_PIN 33

const char *ssid = "StopLeak";
const char *password = "stopleak";

WiFiServer server(80);

float PULSOS_POR_LITRO = 442.0;
float VAZAO_MINIMA = 0.20;
unsigned long TEMPO_VAZAMENTO = 60000;

volatile unsigned long pulsos = 0;
unsigned long ultimoCalculo = 0;
unsigned long inicioFluxo = 0;

float vazao = 0.0;
float volumeTotal = 0.0;

bool fluxoDetectado = false;
bool vazamentoDetectado = false;
bool valvulaAberta = true;

void IRAM_ATTR contarPulso() { pulsos++; }

void abrirValvula() {
  digitalWrite(VALVULA_PIN, HIGH);
  valvulaAberta = true;
  Serial.println("\n================================\nVALVULA ABERTA\n================================");
}

void fecharValvula() {
  digitalWrite(VALVULA_PIN, LOW);
  valvulaAberta = false;
  Serial.println("\n================================\nVALVULA FECHADA\n================================");
  if (vazamentoDetectado) {
    Serial.println("Vazamento detectado. Fluxo interrompido.");
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(SENSOR_PIN1, INPUT_PULLUP);
  pinMode(VALVULA_PIN, OUTPUT);
  
  digitalWrite(VALVULA_PIN, HIGH);
  valvulaAberta = true;

  attachInterrupt(digitalPinToInterrupt(SENSOR_PIN1), contarPulso, RISING);

  WiFi.softAP(ssid, password);
  IPAddress IP = WiFi.softAPIP();
  server.begin();

  Serial.println("\n>>> Sistema de Detecção e Corte Ativo.");
  Serial.print("Acesse no browser: http://"); Serial.println(IP);
}

void loop() {
  unsigned long agora = millis();

  if (agora - ultimoCalculo >= 1000) {
    ultimoCalculo = agora;

    noInterrupts();
    unsigned long pulsosAtual = pulsos;
    pulsos = 0;
    interrupts();

    vazao = (pulsosAtual * 60.0) / PULSOS_POR_LITRO;
    volumeTotal += (pulsosAtual / PULSOS_POR_LITRO);

    if (vazao >= VAZAO_MINIMA) {
      if (!fluxoDetectado) {
        fluxoDetectado = true;
        inicioFluxo = agora;
      }

      unsigned long tempoFluxo = agora - inicioFluxo;

      if (tempoFluxo >= TEMPO_VAZAMENTO && !vazamentoDetectado) {
        vazamentoDetectado = true;
        fecharValvula();
      }
    } else {
      if (fluxoDetectado) vazamentoDetectado = false;
      fluxoDetectado = false;
    }
  }

  WiFiClient client = server.available();
  if (client) {
    String request = "";
    unsigned long tempoInicio = millis();

    while (client.connected() && millis() - tempoInicio < 1000) {
      if (client.available()) {
        char c = client.read();
        request += c;

        if (c == '\n') {
          if (request.indexOf("GET /abrir") >= 0) abrirValvula();
          if (request.indexOf("GET /fechar") >= 0) fecharValvula();

          client.println("HTTP/1.1 200 OK\r\nContent-type:text/html\r\nConnection: close\r\n");
          client.println("<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width, initial-scale=1'><meta http-equiv='refresh' content='2'><title>StopLeak</title></head><body>");
          client.println("<h1>StopLeak - Painel Local</h1>");
          client.print("<h2>Vazao: "); client.print(vazao, 2); client.println(" L/min</h2>");
          client.print("<h2>Volume: "); client.print(volumeTotal, 2); client.println(" L</h2>");
          client.print("<h2>Valvula: "); client.println(valvulaAberta ? "ABERTA" : "FECHADA"); client.println("</h2>");
          client.println("<a href='/abrir'><button>ABRIR</button></a> <a href='/fechar'><button>FECHAR</button></a>");
          client.println("</body></html>");
          break;
        }
      }
    }
    client.stop();
  }
}