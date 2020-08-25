import mqtt from "mqtt";
import {
  SEC_TOPIC_OPEN,
  SEC_TOPIC_START_TLS,
  SEC_TOPIC_REQ_ENC,
  SEC_TOPIC_RES_ENC,
} from "./topics";

const isSecure = false;
const host = "localhost";
const port = isSecure ? "8883" : "1883";
const protocol = isSecure ? "mqtts" : "mqtt";
const protocolId = "MQTT";
const protocolVersion = 4;

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
  mqtt_client.subscribe(SEC_TOPIC_OPEN);
  console.log("subscribe security topic open as " + SEC_TOPIC_OPEN);

  mqtt_client.subscribe(SEC_TOPIC_START_TLS);
  console.log("subscribe security topic start TLS as " + SEC_TOPIC_START_TLS);

  mqtt_client.subscribe(SEC_TOPIC_REQ_ENC);
  console.log(
    "subscribe security topic encryption request as " + SEC_TOPIC_REQ_ENC,
  );
});

mqtt_client.on("message", (topic: string, message: string) => {
  console.log("message called.");
  console.log("topic: ", topic);
  console.log("message: ", message);
  mqtt_client.publish(
    SEC_TOPIC_RES_ENC,
    `request topic: ${topic}, message: ${message}`,
  );
});
