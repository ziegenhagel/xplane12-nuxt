# installation first time

`sh
npm install -g local-cors-proxy
yarn
`

# starten

1. start xplane
2. write your ip into `server/utils/constants.ts`
2. `lcp --proxyUrl http://localhost:8086 --port 8087`
2. `yarn dev --host`
3. call `http://[your-ip]:3000` in ipad
