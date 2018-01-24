"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const events_1 = require("events");
const buttplug_1 = require("buttplug");
/**
 * Connector class for using the node ws library as a websocket client to a
 * buttplug server. Users should build an instance of this class and pass it to
 * the ButtplugClient.Connect() function.
 */
class ButtplugNodeWebsocketClientConnector extends events_1.EventEmitter {
    /***
     * @param url URL of buttplug server to connect to
     * @param rejectUnauthorized If true, reject unauthorized certificates that fail verification
     */
    constructor(url, rejectUnauthorized) {
        super();
        /// Websocket client
        this.wsClient = null;
        /// If true, reject unauthorized certificates that fail verification
        this.rejectUnauthorized = true;
        /***
         * Called by ButtplugClient to establish websocket connection.
         */
        this.Connect = () => __awaiter(this, void 0, void 0, function* () {
            let res;
            let rej;
            const ws = new WebSocket(this.url, {
                rejectUnauthorized: this.rejectUnauthorized,
            });
            const p = new Promise((resolve, reject) => { res = resolve; rej = reject; });
            // In websockets, our error rarely tells us much, as for security reasons
            // browsers usually only throw Error Code 1006. It's up to those using this
            // library to state what the problem might be.
            const conErrorCallback = (ev) => rej();
            ws.on("open", (ev) => __awaiter(this, void 0, void 0, function* () {
                ws.removeAllListeners();
                this.wsClient = ws;
                this.wsClient.on("message", (aMsg) => { this.emit("message", buttplug_1.FromJSON(aMsg)); });
                this.wsClient.on("close", this.Disconnect);
                this.wsClient.on("error", (e) => buttplug_1.ButtplugLogger.Logger.Info("Websocket Error (Happens on close, possibly ignorable): " + e));
                res();
            }));
            ws.on("close", conErrorCallback);
            return p;
        });
        /***
         * Called by ButtplugClient to disconnect websocket connection.
         */
        this.Disconnect = () => {
            if (!this.IsConnected()) {
                return;
            }
            this.wsClient.close();
            this.wsClient = null;
        };
        /***
         * Called by ButtplugClient to send a message over the websocket.
         */
        this.Send = (msg) => {
            if (!this.IsConnected()) {
                throw new Error("Not connected!");
            }
            // Make sure our message is packed in an array. Messy.
            this.wsClient.send("[" + msg.toJSON() + "]");
        };
        /***
         * Called by ButtplugClient to verify connection status.
         */
        this.IsConnected = () => {
            return this.wsClient !== null;
        };
        this.rejectUnauthorized = rejectUnauthorized;
        this.url = url;
    }
}
exports.ButtplugNodeWebsocketClientConnector = ButtplugNodeWebsocketClientConnector;
//# sourceMappingURL=ButtplugNodeWebsocketClientConnector.js.map