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
        this.nextRrefId = 1;
        this.pendingReads = new Map();

        this.setupSocketListeners();
        this.connect();

        XPlaneUDP.instance = this;
    }

    setupSocketListeners() {
        this.socket.on('error', (error) => {
            console.error('UDP Socket Error:', error);
            this.reconnect();
        });

        this.socket.on('message', (msg, rinfo) => {
            const header = msg.toString('utf8', 0, 4);

            if (header === 'RREF') {
                // Debug: Zeige den kompletten Buffer
                console.log('Raw buffer:', msg);

                // RREF format: 'RREF' (4 bytes) + null (1 byte) + [id (4 bytes) + value (4 bytes)]
                const dataSize = msg.length - 5;  // Remove header + null byte
                const numValues = Math.floor(dataSize / 8);

                console.log(`Received RREF response with ${numValues} values`);

                for (let i = 0; i < numValues; i++) {
                    const offset = 5 + (i * 8);
                    const id = msg.readInt32LE(offset);
                    const value = msg.readFloatLE(offset + 4);

                    console.log(`RREF value for ID ${id}: ${value}`);

                    if (this.pendingReads.has(id)) {
                        const { resolve, timer, dref } = this.pendingReads.get(id);
                        clearTimeout(timer);
                        this.pendingReads.delete(id);
                        this.unsubscribeFromDataRef(id, dref);
                        resolve(value);
                    }
                }
            }
        });

        this.socket.bind(0, '0.0.0.0');
    }

    connect() {
        if (!this.isConnected) {
            this.socket = dgram.createSocket('udp4');
            this.setupSocketListeners();
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
                if (error) reject(error);
                else resolve();
            });
        });
    }

    writeDref(dref, value) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                this.connect();
            }

            const buffer = Buffer.alloc(509);
            buffer.write('DREF\0', 0);
            buffer.writeFloatLE(value, 5);
            buffer.write(dref, 9);

            this.socket.send(buffer, this.xplanePort, this.xplaneAddr, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }

    subscribeToDataRef(dref) {
        const id = this.nextRrefId++;

        // Create buffer: RREF + null + frequency (4 bytes) + id (4 bytes) + dref path
        const buffer = Buffer.alloc(413); // 5 + 4 + 4 + 400

        // Clear buffer first
        buffer.fill(0);

        // Write header
        buffer.write('RREF\0', 0);

        // Write frequency (1 Hz)
        buffer.writeInt32LE(1, 5);

        // Write id
        buffer.writeInt32LE(id, 9);

        // Write dref path (null-terminated string)
        buffer.write(dref, 13);

        console.log(`Sending RREF request for ${dref} with ID ${id}`);
        console.log('Request buffer:', buffer);

        this.socket.send(buffer, this.xplanePort, this.xplaneAddr, (error) => {
            if (error) {
                console.error(`Failed to send RREF request: ${error}`);
            } else {
                console.log(`RREF request sent successfully`);
            }
        });

        return id;
    }

    unsubscribeFromDataRef(id, dref) {
        // Create buffer with same format but frequency = 0
        const buffer = Buffer.alloc(413);
        buffer.fill(0);
        buffer.write('RREF\0', 0);
        buffer.writeInt32LE(0, 5);  // frequency = 0 Hz
        buffer.writeInt32LE(id, 9);
        buffer.write(dref, 13);

        this.socket.send(buffer, this.xplanePort, this.xplaneAddr, (error) => {
            if (error) {
                console.error(`Failed to unsubscribe from RREF: ${error}`);
            }
        });
    }

    readDref(dref) {
        return new Promise((resolve, reject) => {
            console.log(`Reading DataRef: ${dref}`);
            const id = this.subscribeToDataRef(dref);

            const timer = setTimeout(() => {
                if (this.pendingReads.has(id)) {
                    this.pendingReads.delete(id);
                    this.unsubscribeFromDataRef(id, dref);
                    reject(new Error(`Timeout waiting for DataRef value: ${dref}`));
                }
            }, 5000);

            this.pendingReads.set(id, { resolve, timer, dref });
        });
    }

    async processBatchOperations(operations) {
        const results = [];
        console.log('Processing batch operations:', operations);

        for (const op of operations) {
            try {
                let result;
                switch (op.type) {
                    case 'command':
                        await this.sendCommand(op.command);
                        result = { success: true, type: 'command', command: op.command };
                        break;

                    case 'write':
                        await this.writeDref(op.dref, op.value);
                        result = { success: true, type: 'write', dref: op.dref, value: op.value };
                        break;

                    case 'read':
                        const value = await this.readDref(op.dref);
                        result = { success: true, type: 'read', dref: op.dref, value };
                        break;

                    default:
                        result = { success: false, error: 'Unknown operation type' };
                }
                results.push(result);
            } catch (error) {
                console.error(`Error processing operation:`, op, error);
                results.push({
                    success: false,
                    error: error.message,
                    operation: op
                });
            }
        }

        return results;
    }

    close() {
        if (this.isConnected) {
            for (const { timer } of this.pendingReads.values()) {
                clearTimeout(timer);
            }
            this.pendingReads.clear();

            this.socket.close();
            this.isConnected = false;
            XPlaneUDP.instance = null;
        }
    }
}

export default defineEventHandler(async (event) => {
    const { operations } = await readBody(event);

    if (!Array.isArray(operations)) {
        throw createError({
            statusCode: 400,
            message: 'Operations must be an array'
        });
    }

    try {
        const xp = new XPlaneUDP();
        const results = await xp.processBatchOperations(operations);
        return { success: true, results };
    } catch (error) {
        console.error('Error:', error);
        throw createError({
            statusCode: 500,
            message: error.message
        });
    }
});
