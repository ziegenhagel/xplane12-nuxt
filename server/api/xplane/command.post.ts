// xplaneConnection.js
import * as dgram from "node:dgram";
import { IP } from "~/server/utils/env";

class XPlaneUDP {
    static instance = null;

    constructor(xplaneIP = IP, xplanePort = 49000) {
        if (XPlaneUDP.instance) {
            return XPlaneUDP.instance;
        }

        this.socket = dgram.createSocket('udp4');
        this.xplaneAddr = xplaneIP;
        this.xplanePort = xplanePort;
        this.isConnected = false;

        // Verbindung bei Inaktivität nicht automatisch schließen
        this.socket.unref();

        // Error handling
        this.socket.on('error', (error) => {
            console.error('UDP Socket Error:', error);
            this.reconnect();
        });

        XPlaneUDP.instance = this;
    }

    connect() {
        if (!this.isConnected) {
            this.socket = dgram.createSocket('udp4');
            this.socket.unref();
            this.isConnected = true;
        }
    }

    reconnect() {
        if (this.isConnected) {
            try {
                this.socket.close();
            } catch (error) {
                console.error('Error closing socket:', error);
            }
        }
        this.connect();
    }

    sendCommand(command) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                this.connect();
            }

            const buffer = Buffer.alloc(6 + command.length);
            buffer.write('CMND\0', 0);
            buffer.write(command, 5);
            buffer[buffer.length - 1] = 0x00;

            this.socket.send(buffer, this.xplanePort, this.xplaneAddr, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    sendDref(dref, value) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                this.connect();
            }

            const buffer = Buffer.alloc(509);
            buffer.write('DREF\0', 0);
            buffer.writeFloatLE(value, 5);
            buffer.write(dref, 9);

            this.socket.send(buffer, this.xplanePort, this.xplaneAddr, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    sendData(index, values) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                this.connect();
            }

            const buffer = Buffer.alloc(36);
            buffer.writeInt32LE(index, 0);

            for (let i = 0; i < Math.min(values.length, 8); i++) {
                buffer.writeFloatLE(values[i], 4 + (i * 4));
            }

            this.socket.send(buffer, this.xplanePort, this.xplaneAddr, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    close() {
        if (this.isConnected) {
            this.socket.close();
            this.isConnected = false;
            XPlaneUDP.instance = null;
        }
    }
}

// handler.js
export default defineEventHandler(async (event) => {
    const { cmd } = await readBody(event);

    try {
        const xp = new XPlaneUDP(); // Wird automatisch die bestehende Instanz zurückgeben
        await xp.sendCommand(cmd);
        return { status: 'success' };
    } catch (error) {
        console.error('Fehler:', error);
        return { status: 'error', message: error.message };
    }
});
