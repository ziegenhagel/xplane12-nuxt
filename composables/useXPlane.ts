import { NUXT_API_BASE } from "~/server/utils/constants";

export const useXPlane = () => {
    const executeOperations = async (operations) => {
        return await fetch(`${NUXT_API_BASE}/api/xplane/udp`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ operations })
        }).then(response => response.json());
    };

    // Single operations
    const command = async (cmd) => {
        return await commands([cmd]);
    };

    const readDataref = async (name) => {
        return await fetch(NUXT_API_BASE+'/api/xplane/read', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name})
        }).then(response => response.json())
    };

    const writeDataref = async (name, value) => {
        return await writeDatarefs([{ name, value }]);
    };

    // Batch operations
    const commands = async (cmdArray) => {
        const operations = cmdArray.map(cmd => ({
            type: 'command',
            command: cmd
        }));

        const response = await executeOperations(operations);

        // Wenn nur ein Command ausgeführt wurde, geben wir nur dessen Ergebnis zurück
        if (cmdArray.length === 1) {
            return response.results[0];
        }

        return response;
    };

    const readDatarefs = async (nameArray) => {
        const operations = nameArray.map(name => ({
            type: 'read',
            dref: name
        }));

        const response = await executeOperations(operations);

        // Wenn nur ein Dataref gelesen wurde, geben wir nur dessen Ergebnis zurück
        if (nameArray.length === 1) {
            return response.results[0];
        }

        return response;
    };

    const writeDatarefs = async (datarefArray) => {
        const operations = datarefArray.map(({ name, value }) => ({
            type: 'write',
            dref: name,
            value: value
        }));

        const response = await executeOperations(operations);

        // Wenn nur ein Dataref geschrieben wurde, geben wir nur dessen Ergebnis zurück
        if (datarefArray.length === 1) {
            return response.results[0];
        }

        return response;
    };

    // Convenience-Methode für gemischte Operationen
    const batch = async ({ commands = [], reads = [], writes = [] }) => {
        const operations = [
            ...commands.map(cmd => ({
                type: 'command',
                command: cmd
            })),
            ...reads.map(name => ({
                type: 'read',
                dref: name
            })),
            ...writes.map(({ name, value }) => ({
                type: 'write',
                dref: name,
                value: value
            }))
        ];

        return await executeOperations(operations);
    };

    return {
        // Single operations
        command,
        readDataref,
        writeDataref,

        // Batch operations
        commands,
        readDatarefs,
        writeDatarefs,

        // Mixed batch operations
        batch
    };
};
