import Log, { serializeOffset } from './index'

const log = new Log({
  logFileToAppend: './example.log'
})

console.log('new log', log)
console.log('for best effect, tail the log file in another tab: `tail -f ' + log.path + '`')


let offset = 0

setInterval(async () => {
  const result = await log.write({
    t: Date.now()
  })
  // console.log(result)
  offset = result.offset
}, 1000)


// setInterval(async () => {
//   const str = log.readFromDisk(offset)
//   offset = str.size
//   str.on('data', console.log)
//     .on('end', () => console.log('end', str.size))

// }, 5000)

log.stream()
  .on('data', (data: any) => {
    console.log({data, o: serializeOffset(data.meta.epoch, data.meta.base, data.offset)})
  })
  .on('end', () => console.log('end'))
  .on('error', console.log)

setInterval(async () => {
  try {
    await log.truncate()
    console.log('truncated')
  } catch (e) {
    console.log('err truncating', e)
  }
}, 20000)