import mqtt, { Packet } from "mqtt";
import {
  TOPIC_SEC_CLIENT_OPEN,
  TOPIC_SEC_CLIENT_START_TLS,
  TOPIC_SEC_CLIENT_REQ_ENC,
  TOPIC_SEC_CLIENT_RES_ENC,
  TOPIC_SEC_SERVER_RES_ENC,
} from "./topics";

const isSecure = false;
const host = "localhost";
const port = isSecure ? "8883" : "1883";
const protocol = isSecure ? "mqtts" : "mqtt";
const protocolId = "MQTT";
const protocolVersion = 4;

const interval = 5000;

const connectOptions = {
  host,
  port,
  protocol,
  keepalive: 10,
  protocolId,
  protocolVersion,
  clean: true,
  reconnectPeriod: 2000,
  connectTimeout: 2000,
  // key: fs.readFileSync("./server-key.pem"),
  // cert: fs.readFileSync("./server-crt.pem"),
  rejectUnauthorized: false,
};

const mqtt_client = mqtt.connect(connectOptions);

mqtt_client.on("connect", () => {
  mqtt_client.subscribe(TOPIC_SEC_CLIENT_OPEN);
  console.log("subscribe security topic open as " + TOPIC_SEC_CLIENT_OPEN);

  mqtt_client.subscribe(TOPIC_SEC_CLIENT_START_TLS);
  console.log(
    "subscribe security topic start TLS as " + TOPIC_SEC_CLIENT_START_TLS,
  );

  mqtt_client.subscribe(TOPIC_SEC_CLIENT_REQ_ENC);
  console.log(
    "subscribe security topic encryption request as " +
      TOPIC_SEC_CLIENT_REQ_ENC,
  );

  mqtt_client.subscribe(TOPIC_SEC_SERVER_RES_ENC);
  console.log(
    "subscribe security topic encryption request as " +
      TOPIC_SEC_SERVER_RES_ENC,
  );
});

mqtt_client.on("message", (topic: string, message: Buffer, packet: Packet) => {
  console.log("client message called.");
  console.log("topic: ", topic);
  console.log("message: ", message.toString());
  console.log("packet: ", packet);
  setTimeout(() => {
    mqtt_client.publish(
      TOPIC_SEC_CLIENT_RES_ENC,
      `client eco > request topic: ${topic}`,
    );
  }, interval);
});

setTimeout(() => {
  console.log("on client publish called.");
  mqtt_client.publish(
    TOPIC_SEC_CLIENT_RES_ENC,
    "This is the message from the client.",
  );
}, interval * 2);
