# installation first time

`sh
npm install -g local-cors-proxy
yarn
`

# start

1. start xplane and start a fligth already
2. call `yarn dev`
3. call `http://[your-ip]:3000` somewhere in network (not localhost!!)

## start (manually)

if above start does not work, try to start the server manually

1. start xplane and start a fligth already
1. write your ip into `server/utils/env.ts`
2. `lcp --proxyUrl http://localhost:8086 --port 8087`
2. `nuxi dev --host`
3. call `http://[your-ip]:3000` somewhere in network (not localhost!!)
