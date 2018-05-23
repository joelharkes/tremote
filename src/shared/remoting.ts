// import { logger } from "../main/logger";

/**
 * Remote structure send over ipc.
 */
interface RemoteArgs {
    method: string;
    respondChannel?: string;
    args: any[];
}

interface RemoteResponseArgs {
    result?: any;
    error?: Error;
}

export class RemoteSender {
    channel: string;
    ipc: Electron.IpcRenderer;
    counter = 1;
    constructor(channel: string = "control") {
        this.channel = channel;
        try {
            this.ipc = require("electron").ipcRenderer;
        } catch (err) {
            console.log("failed to load electron ipc");
        }
    }

    public async Send(sendArgs: RemoteArgs) {
        return new Promise((y, n) => {
            var respChannel = `resp-${this.counter++}`;
            sendArgs.respondChannel = respChannel;
            this.ipc.once(respChannel, (event, args: RemoteResponseArgs) => {
                if (args.error) {
                    return n(args.error);
                }
                return y(args.result);
            });
            this.ipc.send(this.channel, sendArgs);
        });
    }
}

/**
 * Creates remote client that sends requests to main process.
 * Wraps a certain interface, and always returns promise.
 */
export function createRemoteSender<T>(channel: string = "control"): T {
    var target = new RemoteSender(channel);
    return new Proxy(target, {
        get: function (obj: RemoteSender, prop: string) {
            return function (...args: any[]) {
                return obj.Send({ method: prop, args: args });
            };
        }
    }) as any;
}

export class RemoteResponder<T> {
    responder: T;
    ipc: Electron.IpcMain;
    constructor(responder: T, channel: string = "control") {
        this.ipc = require("electron").ipcMain;
        this.responder = responder;

        this.ipc.on(channel, async (event: Electron.IpcMessageEvent, args: RemoteArgs) => {
            try {
                var result = this.responder[args.method].apply(this.responder, args.args);
                if (result instanceof Promise) {
                    // so we dont transfer promise objects but just results over IPC.
                    // on the other side its converted to promsie based structure anyway.
                    result = await result;
                }
                event.sender.send(args.respondChannel || channel, { result } as RemoteResponseArgs);
            } catch (error) {
                // logger.error(error, { origin: "remoting", ...args});
                event.sender.send(args.respondChannel || channel, { error } as RemoteResponseArgs);
            }
        });
    }
}
