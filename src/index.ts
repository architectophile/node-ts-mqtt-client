import mqtt, { MqttClient, Packet } from "mqtt";
import { FAILURE, SUCCESS } from "./Constants";
import Dim, { ReadHandler, WriteHandler } from "./Dim";

import {
  TOPIC_NCUBE_CONTROL_AUTH_START,
  TOPIC_NCUBE_CONTROL_AUTH_REQ_AUTH,
  TOPIC_NCUBE_CONTROL_ENC_REQ_ENC,
  TOPIC_NCUBE_CONTROL_SIG_REQ_SIG,
  TOPIC_NCUBE_DATA_AUTH_RES_AUTH,
} from "./Topics";

interface ResAuth {
  resolve?: (
    value?: string | PromiseLike<string | null> | null | undefined,
  ) => void;
  buffer: string[];
}

const registeredResAuth: ResAuth = {
  resolve: undefined,
  buffer: [],
};

const isSecure = false;
const host = "localhost";
const port = isSecure ? "8883" : "1883";
const protocol = isSecure ? "mqtts" : "mqtt";
const protocolId = "MQTT";
const protocolVersion = 4;

const interval = 500;

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
  mqtt_client.subscribe(TOPIC_NCUBE_CONTROL_AUTH_START);
  console.log(
    "subscribe auth start topic at " + TOPIC_NCUBE_CONTROL_AUTH_START,
  );

  mqtt_client.subscribe(TOPIC_NCUBE_CONTROL_AUTH_REQ_AUTH);
  console.log(
    "subscribe auth request topic at " + TOPIC_NCUBE_CONTROL_AUTH_REQ_AUTH,
  );

  mqtt_client.subscribe(TOPIC_NCUBE_CONTROL_ENC_REQ_ENC);
  console.log(
    "subscribe encryption request topic at " + TOPIC_NCUBE_CONTROL_ENC_REQ_ENC,
  );

  mqtt_client.subscribe(TOPIC_NCUBE_CONTROL_SIG_REQ_SIG);
  console.log(
    "subscribe signing request topic at " + TOPIC_NCUBE_CONTROL_SIG_REQ_SIG,
  );
});

mqtt_client.on("message", (topic: string, message: Buffer, packet: Packet) => {
  console.log("client message called.");
  console.log("topic: ", topic);
  console.log("message: ", message.toString());
  console.log("packet: ", packet);

  switch (topic) {
    case TOPIC_NCUBE_CONTROL_AUTH_START: {
      break;
    }
    case TOPIC_NCUBE_CONTROL_AUTH_REQ_AUTH: {
      registeredResAuth.buffer.push(message.toString());
      break;
    }
    case TOPIC_NCUBE_CONTROL_ENC_REQ_ENC: {
      break;
    }
    case TOPIC_NCUBE_CONTROL_SIG_REQ_SIG: {
      break;
    }
    default:
      return;
  }
});

const readResolver = (
  resolve: (
    value?: string | PromiseLike<string | null> | null | undefined,
  ) => void,
) => {
  if (registeredResAuth.buffer && registeredResAuth.buffer.length > 0) {
    // get the earliest the message and shift
    const message = registeredResAuth.buffer.shift();

    resolve(message);
    return;
  } else {
    setTimeout(() => {
      readResolver(resolve);
    }, interval);
    return;
  }
};

export class WriteHandlerImpl implements WriteHandler {
  mqttClient: MqttClient;
  constructor(mqttClient: MqttClient) {
    this.mqttClient = mqttClient;
  }

  write = (message: string): Promise<number> => {
    return new Promise((resolve): void => {
      try {
        this.mqttClient.publish(TOPIC_NCUBE_DATA_AUTH_RES_AUTH, message);
        resolve(SUCCESS);
        return;
      } catch (e) {
        resolve(FAILURE);
        return;
      }
    });
  };
}

export class ReadHandlerImpl implements ReadHandler {
  read = (): Promise<string | null> => {
    return new Promise((resolve): void => {
      try {
        readResolver(resolve);
        return;
      } catch (e) {
        resolve(null);
        return;
      }
    });
  };
}

const writeHandler: WriteHandler = new WriteHandlerImpl(mqtt_client);
const readHandler: ReadHandler = new ReadHandlerImpl();
const dim: Dim = new Dim(writeHandler, readHandler);
dim.tlsHandshake();
