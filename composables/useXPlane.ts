import {XPLANE_API_BASE, NUXT_API_BASE} from "~/server/utils/constants";

export const useXPlane = () => {

    const readDataref = async (name) => {
        return await fetch(NUXT_API_BASE+'/api/xplane/read', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name})
        }).then(response => response.json())
    }

    const writeDataref = async (name, value) => {
        return await fetch(NUXT_API_BASE+'/api/xplane/write', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name, value})
        }).then(response => response.json())
    }

    const command = async (cmd) => {
        return await fetch(NUXT_API_BASE+'/api/xplane/command', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({cmd})
        }).then(response => response.json())
    }

    return {
        readDataref,
        writeDataref,
        command
    }
}
