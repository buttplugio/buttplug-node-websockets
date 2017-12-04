import * as fs from "fs";
import * as ws from "ws";
import * as https from "https";
import * as http from "http";
import { EventEmitter } from "events";
import { ButtplugMessage, FromJSON, ButtplugServer } from "buttplug";

export class ButtplugNodeWebsocketServer extends ButtplugServer {

  private wsServer: ws.Server | null = null;

  public constructor() {
    super();
  }

  public StartInsecureServer(aPort: number = 12345, aHost: string = "localhost") {
    this.wsServer = new ws.Server({host: aHost, port: aPort});
  }

  public StartSecureServer(aCert: string,
                           aPrivate: string,
                           aPort: number = 12345,
                           aHost: string = "localhost") {
    const pems: any = {};
    pems.cert = fs.readFileSync(aCert);
    pems.private = fs.readFileSync(aPrivate);
    const server = https.createServer({
      cert: pems.cert,
      key: pems.private,
    }).listen(aPort, aHost);
    this.wsServer = new ws.Server({server});
  }

  public async StopServer() {
    if (this.wsServer === null) {
      throw new Error("Websocket server is null!");
    }
    // ws's close doesn't follow the callback style util.promisify expects (only
    // has a passing callback, no failing), so just build our own. Could've
    // wrapped it in a 2 argument closure but eh.
    let closeRes;
    const closePromise = new Promise((res, rej) => { closeRes = res; });
    this.wsServer.close(() => closeRes());
    return closePromise;
  }

  private async InitServer() {
    if (this.wsServer === null) {
      throw new Error("Websocket server is null!");
    }
    const bs: ButtplugServer = this;
    this.wsServer.on("connection", function connection(client) {
      client.on("message", async (message) => {
        const msg = FromJSON(message);
        for (const m of msg) {
          const outgoing = await bs.SendMessage(m);
          client.send("[" + outgoing.toJSON() + "]");
        }
      });

      bs.on("message", function outgoing(message) {
        client.send("[" + message.toJSON() + "]");
      });
    });
  }
}
