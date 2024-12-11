# installation first time

`sh
npm install -g local-cors-proxy
yarn
`

# starten

1. start xplane and start a fligth already

then call

2. `yarn dev`

if that does not work, try to start the server manually

2. write your ip into `server/utils/env.ts`
2. `lcp --proxyUrl http://localhost:8086 --port 8087`
2. `nuxi dev --host`
3. call `http://[your-ip]:3000` in ipad (not localhost!!)
