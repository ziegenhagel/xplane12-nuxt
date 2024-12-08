import {XPLANE_API_BASE} from "~/server/utils/constants";

export const useXPlane = () => {

    const url = 'http://192.168.178.35:3000'
    const readDataref = async (name) => {
        return await fetch(url+'/api/xplane/read', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name})
        }).then(response => response.json())
    }

    const writeDataref = async (name, value) => {
        return await fetch(url+'/api/xplane/write', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name, value})
        }).then(response => response.json())
    }

    return {
        readDataref,
        writeDataref
    }
}
