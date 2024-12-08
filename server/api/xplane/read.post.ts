import {XPLANE_API_BASE} from '~/server/utils/constants'

export default defineEventHandler(async (event) => {
    const {name} = await readBody(event)

    // First get the dataref id
    const idResponse = await fetch(`${XPLANE_API_BASE}/datarefs?filter[name]=${name}`)
    const idData = await idResponse.json()

    if (!idData.data?.[0]) {
        throw createError({
            statusCode: 404,
            message: `Dataref ${name} not found`
        })
    }

    // Then get the value
    const response = await fetch(`${XPLANE_API_BASE}/datarefs/${idData.data[0].id}/value`)
    return response.json()
})
