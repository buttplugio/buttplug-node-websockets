import { ButtplugNodeWebsocketServer, ButtplugNodeWebsocketClientConnector } from "../src/index";
import { ButtplugClient, ButtplugServer, Test } from "buttplug";
import { TestDeviceManager } from "buttplug/dist/main/src/devtools";

describe("Buttplug Node Websocket tests", () => {
  it("should throw on erroneous connector states", function() {
    const connector =
      new ButtplugNodeWebsocketClientConnector("ws://localhost:12345/buttplug", false);
    expect(() => connector.Send(new Test("This should throw", 1))).toThrow();
  });

  it("should connect insecurely to itself, scan, find test devices", async function() {
    const server = new ButtplugNodeWebsocketServer("Buttplug Test Websocket Server");
    server.AddDeviceManager(TestDeviceManager.Get());
    // Insecure hosting, on localhost:12345
    server.StartInsecureServer(12345, "localhost");

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
    bpc.on("deviceremoved", async () => {
      bpc.Disconnect();
      await server.StopServer();
      res();
    });
    TestDeviceManager.Get().VibrationDevice.Disconnect();
    return p;
  });

  it("should disconnect cleanly from client side", async function() {
    const server = new ButtplugNodeWebsocketServer("Buttplug Test Websocket Server");
    // Insecure hosting, on localhost:12345
    server.StartInsecureServer(12345, "localhost");
    const connector =
      new ButtplugNodeWebsocketClientConnector("ws://localhost:12345/buttplug", false);

    const bpc = new ButtplugClient("test");
    await bpc.Connect(connector);
    expect(bpc.Connected).toBe(true);
    await bpc.Disconnect();
    expect(bpc.Connected).toBe(false);
    await server.StopServer();
  });

  it("should be able to start/stop multiple times", async () => {
    const server = new ButtplugNodeWebsocketServer("Buttplug Test Websocket Server");
    // Insecure hosting, on localhost:12345
    server.StartInsecureServer(12345, "localhost");
    const connector =
      new ButtplugNodeWebsocketClientConnector("ws://localhost:12345/buttplug", false);

    let bpc = new ButtplugClient("test");
    await bpc.Connect(connector);
    expect(bpc.Connected).toBe(true);
    await bpc.Disconnect();
    expect(bpc.Connected).toBe(false);
    await server.StopServer();

    // Insecure hosting, on localhost:12345
    server.StartInsecureServer(12345, "localhost");

    bpc = new ButtplugClient("test");
    await bpc.Connect(connector);
    expect(bpc.Connected).toBe(true);
    await bpc.Disconnect();
    expect(bpc.Connected).toBe(false);
    await server.StopServer();
});
});
