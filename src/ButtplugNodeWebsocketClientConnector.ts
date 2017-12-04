"use strict";
import * as WebSocket from "ws";
import { EventEmitter } from "events";
import { FromJSON, IButtplugConnector } from "buttplug";

export class ButtplugNodeWebsocketClientConnector extends EventEmitter implements IButtplugConnector {

  private wsClient: WebSocket | null = null;
  private url: string;
  private rejectUnauthorized: boolean = true;

  constructor(aUrl: string, aRejectUnauthorized: boolean) {
    super();
    this.rejectUnauthorized = aRejectUnauthorized;
    this.url = aUrl;
  }

  public async Connect() {
    let res;
    let rej;
    const ws = new WebSocket(this.url, {
      rejectUnauthorized: this.rejectUnauthorized,
    });
    const p = new Promise<void>((resolve, reject) => { res = resolve; rej = reject; });
    // In websockets, our error rarely tells us much, as for security reasons
    // browsers usually only throw Error Code 1006. It's up to those using this
    // library to state what the problem might be.
    const conErrorCallback = (ev) => rej();
    ws.on("open", async (ev) => {
      this.wsClient = ws;
      this.wsClient.on("message", (aMsg) => { this.emit("message", FromJSON(aMsg)); });
      this.wsClient.on("close", this.Disconnect);
      res();
    });
    ws.on("close", conErrorCallback);
    return p;
  }

  public Disconnect() {
    if (!this.IsConnected()) {
      throw new Error("Not connected!");
    }
    this.wsClient!.close();
  }

  public Send(aMsg) {
    if (!this.IsConnected()) {
      throw new Error("Not connected!");
    }
    this.wsClient!.send("[" + aMsg.toJSON() + "]");
  }

  public IsConnected() {
    return this.wsClient !== null;
  }
}
