#include <WiFi.h>
#include <WiFiAP.h>
#include <WiFiClient.h>

// =====================================================
// SISTEMA EMBARCADO DE DETECÇÃO DE VAZAMENTOS
// ESP32 + YF-S201 + RELÉ + VÁLVULA SOLENOIDE
// =====================================================


// =====================================================
// PINOS
// =====================================================

#define SENSOR_PIN 17
#define VALVULA_PIN 33


// =====================================================
// WIFI
// =====================================================

const char *ssid = "StopLeak";
const char *password = "stopleak";

WiFiServer server(80);


// =====================================================
// CALIBRAÇÃO DO SENSOR
// =====================================================

// Valor inicial.
// Depois da calibração, substitua por aquele encontrado.
float PULSOS_POR_LITRO = 442.0;


// =====================================================
// CONFIGURAÇÃO DO VAZAMENTO
// =====================================================

// Vazão mínima considerada como passagem de água
float VAZAO_MINIMA = 0.20;

// Tempo contínuo de fluxo para gerar possível vazamento
// 60 segundos inicialmente
unsigned long TEMPO_VAZAMENTO = 60000;


// =====================================================
// VARIÁVEIS DO SENSOR
// =====================================================

volatile unsigned long pulsos = 0;

unsigned long ultimoCalculo = 0;
unsigned long inicioFluxo = 0;

float vazao = 0.0;
float volumeTotal = 0.0;

bool fluxoDetectado = false;
bool vazamentoDetectado = false;


// =====================================================
// VÁLVULA
// =====================================================

// true  = válvula aberta
// false = válvula fechada

bool valvulaAberta = true;


// =====================================================
// INTERRUPÇÃO DO SENSOR
// =====================================================

void IRAM_ATTR contarPulso() {
  pulsos++;
}


// =====================================================
// ABRIR VÁLVULA
// =====================================================

void abrirValvula() {

  digitalWrite(VALVULA_PIN, HIGH);

  valvulaAberta = true;

  Serial.println();
  Serial.println("================================");
  Serial.println("VALVULA ABERTA");
  Serial.println("================================");
}


// =====================================================
// FECHAR VÁLVULA
// =====================================================

void fecharValvula() {

  digitalWrite(VALVULA_PIN, LOW);

  valvulaAberta = false;

  Serial.println();
  Serial.println("================================");
  Serial.println("VALVULA FECHADA");
  Serial.println("================================");

  if (vazamentoDetectado) {
    Serial.println("Vazamento detectado.");
    Serial.println("Fluxo interrompido.");
  }
}


// =====================================================
// CALIBRAÇÃO
// =====================================================

void calibrarSensor() {

  Serial.println();
  Serial.println("========================================");
  Serial.println("        CALIBRACAO DO YF-S201");
  Serial.println("========================================");

  Serial.println();
  Serial.println("1 - Coloque um recipiente com volume");
  Serial.println("    conhecido na saida da agua.");
  Serial.println();
  Serial.println("2 - Digite o volume utilizado.");
  Serial.println("   Exemplo: 1 para 1 litro.");
  Serial.println();

  Serial.println("Digite o volume em litros:");

  while (Serial.available() == 0) {
    delay(10);
  }

  float volumeConhecido = Serial.parseFloat();

  if (volumeConhecido <= 0) {

    Serial.println("Volume invalido.");
    return;
  }

  // Limpa entrada serial
  while (Serial.available()) {
    Serial.read();
  }

  noInterrupts();

  pulsos = 0;

  interrupts();

  Serial.println();
  Serial.println("Agora libere a agua.");
  Serial.println("Quando o recipiente atingir o volume");
  Serial.println("informado, digite FIM.");
  Serial.println();

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

          PULSOS_POR_LITRO =
            pulsosFinal / volumeConhecido;

          Serial.println();
          Serial.println();
          Serial.println("========================================");
          Serial.println("CALIBRACAO CONCLUIDA");
          Serial.println("========================================");

          Serial.print("Pulsos medidos: ");
          Serial.println(pulsosFinal);

          Serial.print("Volume utilizado: ");
          Serial.print(volumeConhecido, 3);
          Serial.println(" L");

          Serial.print("Novo valor: ");
          Serial.print(PULSOS_POR_LITRO, 2);
          Serial.println(" pulsos/L");

          Serial.println();
          Serial.println("Use este valor no codigo:");
          Serial.print("PULSOS_POR_LITRO = ");
          Serial.print(PULSOS_POR_LITRO, 2);
          Serial.println(";");

          Serial.println("========================================");

        } else {

          Serial.println();
          Serial.println("Nenhum pulso foi detectado.");
        }

        break;
      }
    }

    delay(500);
  }
}


// =====================================================
// SETUP
// =====================================================

void setup() {

  Serial.begin(115200);

  // Sensor
  pinMode(SENSOR_PIN, INPUT_PULLUP);

  // Relé
  pinMode(VALVULA_PIN, OUTPUT);

  // Começa com a válvula aberta
  digitalWrite(VALVULA_PIN, HIGH);

  valvulaAberta = true;


  // Interrupção
  attachInterrupt(
    digitalPinToInterrupt(SENSOR_PIN),
    contarPulso,
    RISING
  );


  // ===================================================
  // WIFI
  // ===================================================

  WiFi.softAP(ssid, password);

  IPAddress IP = WiFi.softAPIP();

  server.begin();


  // ===================================================
  // INFORMAÇÕES
  // ===================================================

  Serial.println();
  Serial.println("========================================");
  Serial.println(" SISTEMA DE DETECCAO DE VAZAMENTOS");
  Serial.println("========================================");

  Serial.println();

  Serial.print("Rede Wi-Fi: ");
  Serial.println(ssid);

  Serial.print("Senha: ");
  Serial.println(password);

  Serial.print("IP DO SITE: http://");
  Serial.println(IP);

  Serial.println();

  Serial.print("Sensor YF-S201: GPIO ");
  Serial.println(SENSOR_PIN);

  Serial.print("Rele/Válvula: GPIO ");
  Serial.println(VALVULA_PIN);
  
  Serial.print("Calibracao: ");
  Serial.print(PULSOS_POR_LITRO);
  Serial.println(" pulsos/L");
  Serial.print("Vazao minima: ");
  Serial.print(VAZAO_MINIMA);
  Serial.println(" L/min");
  Serial.print("Tempo para alerta: ");
  Serial.print(TEMPO_VAZAMENTO / 1000);
  Serial.println(" segundos");
  Serial.println();
  Serial.println("Valvula inicialmente ABERTA.");
  Serial.println();
  Serial.print("Acesse: http://");
  Serial.println(IP);
  Serial.println();
  Serial.println("Para calibrar o sensor, digite:");
  Serial.println("CALIBRAR");
  Serial.println();
}

// =====================================================
// LOOP
// =====================================================

void loop() {

  unsigned long agora = millis();


  // ===================================================
  // COMANDO DE CALIBRAÇÃO
  // ===================================================

  if (Serial.available()) {
    String comando = Serial.readStringUntil('\n');
    comando.trim();
    if (comando.equalsIgnoreCase("CALIBRAR")) {

      calibrarSensor();
    }
  }

  // ===================================================
  // CALCULO A CADA 1 SEGUNDO
  // ===================================================

  if (agora - ultimoCalculo >= 1000) {
    ultimoCalculo = agora;

    // -------------------------------------------------
    // COPIA OS PULSOS
    // -------------------------------------------------

    noInterrupts();
    unsigned long pulsosAtual = pulsos;
    pulsos = 0;
    interrupts();

    // -------------------------------------------------
    // CALCULA VAZÃO
    // -------------------------------------------------

    vazao =
      (pulsosAtual * 60.0) /
      PULSOS_POR_LITRO;

    // -------------------------------------------------
    // CALCULA VOLUME
    // -------------------------------------------------

    float volumeAtual =
      pulsosAtual /
      PULSOS_POR_LITRO;

    volumeTotal += volumeAtual;

    // =================================================
    // DETECÇÃO DE FLUXO
    // =================================================

    if (vazao >= VAZAO_MINIMA) {

      // -----------------------------------------------
      // INICIO DO FLUXO
      // -----------------------------------------------

      if (!fluxoDetectado) {
        fluxoDetectado = true;
        inicioFluxo = agora;
        Serial.println();
        Serial.println("Fluxo de agua detectado.");
      }

      // -----------------------------------------------
      // TEMPO DE FLUXO
      // -----------------------------------------------

      unsigned long tempoFluxo =
        agora - inicioFluxo;

      // -----------------------------------------------
      // VERIFICA VAZAMENTO
      // -----------------------------------------------

      if (
        tempoFluxo >= TEMPO_VAZAMENTO &&
        !vazamentoDetectado
      ) {

        vazamentoDetectado = true;
        Serial.println();
        Serial.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        Serial.println("   POSSIVEL VAZAMENTO DETECTADO");
        Serial.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

        Serial.print("Vazao: ");
        Serial.print(vazao, 3);
        Serial.println(" L/min");

        Serial.print("Tempo de fluxo: ");
        Serial.print(tempoFluxo / 1000);
        Serial.println(" segundos");

        // ---------------------------------------------
        // FECHA A VÁLVULA
        // ---------------------------------------------

        fecharValvula();
      }
    }

    // =================================================
    // SEM FLUXO
    // =================================================

    else {

      if (fluxoDetectado) {
        Serial.println();
        Serial.println("Fluxo de agua interrompido.");

        // Permite uma nova análise
        vazamentoDetectado = false;
      }

      fluxoDetectado = false;
    }

    // =================================================
    // MONITOR SERIAL
    // =================================================

    Serial.println("----------------------------------------");
    Serial.print("Vazao: ");
    Serial.print(vazao, 3);
    Serial.println(" L/min");
    Serial.print("Volume total: ");
    Serial.print(volumeTotal, 3);
    Serial.println(" L");

    if (fluxoDetectado) {

      unsigned long tempoFluxo =
        agora - inicioFluxo;

      Serial.print("Fluxo continuo: ");
      Serial.print(tempoFluxo / 1000);
      Serial.println(" segundos");

    } else {

      Serial.println("Fluxo continuo: 0 segundos");
    }

    Serial.print("Valvula: ");

    if (valvulaAberta) {
      Serial.println("ABERTA");
    } else {
      Serial.println("FECHADA");
    }

    Serial.print("Sistema: ");

    if (vazamentoDetectado) {
      Serial.println("VAZAMENTO DETECTADO");
    } else {
      Serial.println("NORMAL");
    }
  }

  // ===================================================
  // SERVIDOR WEB
  // ===================================================

  WiFiClient client = server.available();
  if (client) {
    String request = "";
    unsigned long tempoInicio =
      millis();

    while (
      client.connected() &&
      millis() - tempoInicio < 1000
    ) {

      if (client.available()) {
        char c = client.read();
        request += c;


        if (c == '\n') {

          // ==========================================
          // ABRIR VÁLVULA
          // ==========================================

          if (
            request.indexOf("GET /abrir") >= 0
          ) {
            abrirValvula();
            // IMPORTANTE:
            // Não desativa o sistema de detecção.
            // Se houver fluxo contínuo suficiente,
            // o sistema ainda poderá fechar a válvula.
          }

          // ==========================================
          // FECHAR VÁLVULA
          // ==========================================

          if (
            request.indexOf("GET /fechar") >= 0
          ) {

            fecharValvula();
            // O sensor continua funcionando.
          }

          // ==========================================
          // RESPOSTA HTTP
          // ==========================================

          client.println("HTTP/1.1 200 OK");
          client.println("Content-type:text/html");
          client.println("Connection: close");
          client.println();

          // ==========================================
          // HTML
          // ==========================================

          client.println("<!DOCTYPE html>");
          client.println("<html>");
          client.println("<head>");
          client.println(
            "<meta name='viewport' "
            "content='width=device-width, initial-scale=1'>"
          );

          client.println(
            "<meta http-equiv='refresh' content='2'>"
          );

          client.println(
            "<title>Sistema de Vazamento</title>"
          );

          // ==========================================
          // CSS
          // ==========================================

          client.println("<style>");
          client.println(
            "body{"
            "font-family:Arial;"
            "text-align:center;"
            "background:#f2f2f2;"
            "padding:20px;"
            "}"
          );

          client.println(
            ".caixa{"
            "background:white;"
            "padding:25px;"
            "border-radius:15px;"
            "max-width:500px;"
            "margin:auto;"
            "}"
          );

          client.println(
            ".valor{"
            "font-size:30px;"
            "font-weight:bold;"
            "}"
          );

          client.println(
            "button{"
            "padding:15px 25px;"
            "font-size:18px;"
            "margin:8px;"
            "border-radius:8px;"
            "border:none;"
            "cursor:pointer;"
            "}"
          );

          client.println(
            ".info{"
            "font-size:18px;"
            "margin:12px;"
            "}"
          );

          client.println("</style>");
          client.println("</head>");

          // ==========================================
          // CORPO
          // ==========================================

          client.println("<body>");
          client.println("<div class='caixa'>");
          client.println(
            "<h1>Sistema de Vazamento</h1>"
          );

          // ==========================================
          // VAZÃO
          // ==========================================

          client.println("<h2>Vazao</h2>");
          client.print(
            "<div class='valor'>"
          );

          client.print(vazao, 2);
          client.println(
            " L/min</div>"
          );

          // ==========================================
          // VOLUME
          // ==========================================

          client.println("<h2>Volume total</h2>");
          client.print(
            "<div class='valor'>"
          );

          client.print(volumeTotal, 2);
          client.println(
            " L</div>"
          );

          // ==========================================
          // TEMPO
          // ==========================================

          client.println(
            "<div class='info'>"
          );

          client.println(
            "Fluxo continuo: "
          );

          if (fluxoDetectado) {
            unsigned long tempoFluxo =
              millis() - inicioFluxo;
            client.print(
              tempoFluxo / 1000
            );

            client.print(" segundos");
          } else {

            client.print("0 segundos");
          }

          client.println("</div>");

          // ==========================================
          // VÁLVULA
          // ==========================================

          client.println("<h2>Valvula</h2>");
          if (valvulaAberta) {
            client.println(
              "<div class='valor'>ABERTA</div>"
            );

          } else {

            client.println(
              "<div class='valor'>FECHADA</div>"
            );
          }

          // ==========================================
          // STATUS
          // ==========================================

          client.println("<h2>Status</h2>");
          if (vazamentoDetectado) {
            client.println(
              "<div class='valor'>"
              "POSSIVEL VAZAMENTO"
              "</div>"
            );

          } else {

            client.println(
              "<div class='valor'>NORMAL</div>"
            );
          }

          // ==========================================
          // BOTÃO ABRIR
          // ==========================================

          client.println(
            "<a href='/abrir'>"
          );

          client.println(
            "<button>ABRIR VALVULA</button>"
          );

          client.println(
            "</a>"
          );

          // ==========================================
          // BOTÃO FECHAR
          // ==========================================

          client.println(
            "<a href='/fechar'>"
          );

          client.println(
            "<button>FECHAR VALVULA</button>"
          );

          client.println(
            "</a>"
          );

          // ==========================================
          // INFORMAÇÕES
          // ==========================================
          client.println("<hr>");
          client.println(
            "<p>Calibracao: "
          );

          client.print(
            PULSOS_POR_LITRO,
            2
          );

          client.println(
            " pulsos/L</p>"
          );

          client.println(
            "<p>Vazao minima: "
          );

          client.print(
            VAZAO_MINIMA,
            2
          );

          client.println(
            " L/min</p>"
          );

          client.println(
            "<p>Tempo para alerta: "
          );

          client.print(
            TEMPO_VAZAMENTO / 1000
          );

          client.println(
            " segundos</p>"
          );
          // ==========================================
          // IP
          // ==========================================

          IPAddress IP =
            WiFi.softAPIP();
          client.println("<hr>");
          client.println(
            "<p>Endereco do site:</p>"
          );

          client.print(
            "<strong>http://"
          );

          client.print(IP);
          client.println(
            "</strong>"
          );

          client.println("</div>");
          client.println("</body>");
          client.println("</html>");
          client.println();

          break;
        }
      }
    }

    client.stop();
  }
}
