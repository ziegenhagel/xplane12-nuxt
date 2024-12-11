import {IP} from "~/server/utils/env";
export const XPLANE_API_BASE = 'http://' + IP + ':8087/proxy/api/v1'
export const NUXT_API_BASE = 'http://' + IP + ':3000'

console.log("running on xplane api base " + XPLANE_API_BASE)
