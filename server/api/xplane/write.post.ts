import {XPLANE_API_BASE} from '~/server/utils/constants'

export default defineEventHandler(async (event) => {
    const {name, value} = await readBody(event)

    // First get the dataref id
    const idResponse = await fetch(`${XPLANE_API_BASE}/datarefs?filter[name]=${encodeURIComponent(name)}`)
    const idData = await idResponse.json()

    if (!idData.data?.[0]) {
        throw createError({
            statusCode: 404,
            message: `Dataref ${name} not found`
        })
    }

    // Then set the value
    const response = await fetch(`${XPLANE_API_BASE}/datarefs/${idData.data[0].id}/value`, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({data: value})
    }).then(response => response.json())

    if (response == null) {
        return {
            success: true
        }
    }
    return {
        success: false,
        response
    }

})
