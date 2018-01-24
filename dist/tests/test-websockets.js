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
const index_1 = require("../src/index");
const buttplug_1 = require("buttplug");
const devtools_1 = require("buttplug/dist/main/src/devtools");
const selfsigned = require("selfsigned");
const tmp = require("tmp");
describe("Buttplug Node Websocket tests", () => {
    it("should throw on erroneous connector states", function () {
        const connector = new index_1.ButtplugNodeWebsocketClientConnector("ws://localhost:12345/buttplug", false);
        expect(() => connector.Send(new buttplug_1.Test("This should throw", 1))).toThrow();
    });
    it("should connect insecurely to itself, scan, find test devices", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const server = new index_1.ButtplugNodeWebsocketServer("Buttplug Test Websocket Server");
            server.AddDeviceManager(devtools_1.TestDeviceManager.Get());
            // Insecure hosting, on localhost:12345
            server.StartInsecureServer(12345, "localhost");
            const connector = new index_1.ButtplugNodeWebsocketClientConnector("ws://localhost:12345/buttplug", false);
            const bpc = new buttplug_1.ButtplugClient("test");
            yield bpc.Connect(connector);
            let res;
            let rej;
            let p = new Promise((resolve, reject) => { res = resolve; rej = reject; });
            bpc.on("deviceadded", () => {
                res();
            });
            yield bpc.StartScanning();
            yield p;
            yield bpc.StopScanning();
            p = new Promise((resolve, reject) => { res = resolve; rej = reject; });
            bpc.on("scanningfinished", () => {
                res();
            });
            yield p;
            p = new Promise((resolve, reject) => { res = resolve; rej = reject; });
            bpc.on("deviceremoved", () => __awaiter(this, void 0, void 0, function* () {
                bpc.Disconnect();
                yield server.StopServer();
                res();
            }));
            devtools_1.TestDeviceManager.Get().VibrationDevice.Disconnect();
            return p;
        });
    });
    it("should disconnect cleanly from client side", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const server = new index_1.ButtplugNodeWebsocketServer("Buttplug Test Websocket Server");
            // Insecure hosting, on localhost:12345
            server.StartInsecureServer(12345, "localhost");
            const connector = new index_1.ButtplugNodeWebsocketClientConnector("ws://localhost:12345/buttplug", false);
            const bpc = new buttplug_1.ButtplugClient("test");
            yield bpc.Connect(connector);
            expect(bpc.Connected).toBe(true);
            yield bpc.Disconnect();
            expect(bpc.Connected).toBe(false);
            yield server.StopServer();
        });
    });
    it("should be able to start/stop multiple times", () => __awaiter(this, void 0, void 0, function* () {
        const server = new index_1.ButtplugNodeWebsocketServer("Buttplug Test Websocket Server");
        // Insecure hosting, on localhost:12345
        server.StartInsecureServer(12345, "localhost");
        const connector = new index_1.ButtplugNodeWebsocketClientConnector("ws://localhost:12345/buttplug", false);
        let bpc = new buttplug_1.ButtplugClient("test");
        yield bpc.Connect(connector);
        expect(bpc.Connected).toBe(true);
        yield bpc.Disconnect();
        expect(bpc.Connected).toBe(false);
        yield server.StopServer();
        // Insecure hosting, on localhost:12345
        server.StartInsecureServer(12345, "localhost");
        bpc = new buttplug_1.ButtplugClient("test");
        yield bpc.Connect(connector);
        expect(bpc.Connected).toBe(true);
        yield bpc.Disconnect();
        expect(bpc.Connected).toBe(false);
        yield server.StopServer();
    }));
    // Test commented out because it will always cause jest to stall after completion.
    //
    // it("should connect securely", async () => {
    //   const attrs = [{ name: "commonName", value: "buttplugtest.com" }];
    //   const pems = selfsigned.generate(attrs, { days: 365 });
    //   const tmpcert = tmp.fileSync();
    //   const tmpprivate = tmp.fileSync();
    //   fs.writeFileSync(tmpcert.name, pems.cert);
    //   fs.writeFileSync(tmpprivate.name, pems.private);
    //   const server = new ButtplugNodeWebsocketServer("Buttplug Test Websocket Server");
    //   server.StartSecureServer(tmpcert.name, tmpprivate.name, 12345, "localhost");
    //   const connector =
    //     new ButtplugNodeWebsocketClientConnector("wss://localhost:12345/buttplug", false);
    //   const bpc = new ButtplugClient("test");
    //   await bpc.Connect(connector);
    //   expect(bpc.Connected).toBe(true);
    //   await bpc.Disconnect();
    //   expect(bpc.Connected).toBe(false);
    //   await server.StopServer();
    //   tmpcert.removeCallback();
    //   tmpprivate.removeCallback();
    // });
});
//# sourceMappingURL=test-websockets.js.map