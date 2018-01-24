import { ButtplugNodeWebsocketServer, ButtplugNodeWebsocketClientConnector } from "../src/index";
import { ButtplugClient, ButtplugServer } from "buttplug";
import { TestDeviceManager } from "buttplug/dist/main/src/devtools";

describe("Buttplug Node Websocket tests", () => {
  it("should connect to itself, scan, find test devices", async () => {
    const server = new ButtplugNodeWebsocketServer("Buttplug Test Websocket Server");
    server.AddDeviceManager(TestDeviceManager.Get());
    // Insecure hosting, on localhost:12345
    server.StartInsecureServer();

    const connector =
      new ButtplugNodeWebsocketClientConnector("ws://localhost:12345/buttplug", false);

    const bpc = new ButtplugClient("test");
    await bpc.Connect(connector);
    let res;
    let rej;
    let p = new Promise((resolve, reject) => { res = resolve; rej = reject; });
    bpc.on("deviceadded", () => {
      res();
    });
    await bpc.StartScanning();
    await p;
    await bpc.StopScanning();

    p = new Promise((resolve, reject) => { res = resolve; rej = reject; });
    bpc.on("deviceremoved", () => {
      server.StopServer();
      res();
    });
    TestDeviceManager.Get().VibrationDevice.Disconnect();
    return p;
  });
});
