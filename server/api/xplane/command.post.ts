import * as dgram from "node:dgram";
import {IP} from "~/server/utils/constants";

class XPlaneUDP {
    constructor(xplaneIP = IP, xplanePort = 49000) {
        this.socket = dgram.createSocket('udp4');
        this.xplaneAddr = xplaneIP;
        this.xplanePort = xplanePort;
    }

    /**
     * Sendet einen X-Plane Command
     * @param {string} command - X-Plane Command (z.B. "sim/autopilot/heading_up")
     * @returns {Promise} Promise der aufgelöst wird, wenn der Command gesendet wurde
     */
    sendCommand(command) {
        return new Promise((resolve, reject) => {
            // CMND Format: "CMND\0" + command + "\0"
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

    /**
     * Setzt einen X-Plane DataRef Wert
     * @param {string} dref - Name des DataRef
     * @param {number} value - Zu setzender Wert
     * @returns {Promise} Promise der aufgelöst wird, wenn der DataRef gesendet wurde
     */
    sendDref(dref, value) {
        return new Promise((resolve, reject) => {
            // DREF Format laut Dokumentation:
            // struct dref_struct { xflt var; xchr dref_path[strDIM]; }
            // strDIM ist 500
            const buffer = Buffer.alloc(509); // 5 (DREF\0) + 4 (float) + 500 (path)

            // Header
            buffer.write('DREF\0', 0);

            // Float-Wert (4 bytes)
            buffer.writeFloatLE(value, 5);

            // DREF Path (500 bytes, null-terminated)
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

    /**
     * Sendet Daten an X-Plane
     * @param {number} index - Index des Datenpunkts
     * @param {number[]} values - Array von bis zu 8 Werten
     * @returns {Promise} Promise der aufgelöst wird, wenn die Daten gesendet wurden
     */
    sendData(index, values) {
        return new Promise((resolve, reject) => {
            // DATA Format:
            // struct data_struct { int index; float data[8]; }
            const buffer = Buffer.alloc(36); // 4 (index) + 8 * 4 (floats)

            buffer.writeInt32LE(index, 0);

            // Fülle die Float-Werte
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

    /**
     * Schließt die UDP-Verbindung
     */
    close() {
        this.socket.close();
    }
}


export default defineEventHandler(async (event) => {
    const {cmd} = await readBody(event)


    console.log('Starte X-Plane-Verbindung...');

    const xp = new XPlaneUDP();

    try {
        // Beispiel-Commands
        // await xp.sendCommand('sim/autopilot/heading_up');  // Heading erhöhen
        await xp.sendCommand(cmd);   // Gas erhöhen
        // await xp.sendCommand('sim/systems/wipers_up');   // Gas erhöhen

        // Beispiel-DataRef
        await xp.sendDref('sim/cockpit/switches/gear_handle_status', 1);  // Fahrwerk ausfahren
    } catch (error) {
        console.error('Fehler:', error);
    } finally {
        console.log('Schließe X-Plane-Verbindung...');
        xp.close();
    }


    return {status: 'success'}
})
