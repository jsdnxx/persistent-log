import {Readable} from 'stream'
import * as fs from 'fs'
import { parse } from 'ldjson-stream'
import * as path from 'path'
import { EventEmitter } from 'events'
import * as through from 'through2'
import * as split from 'binary-split'
import * as bs58 from 'bs58'

function errStream (err) {
  return new Readable({
    read () {
      setImmediate(() => {
        this.emit('error', err)
      })
    }
  })
}

const defaultMeta = {
  latest: {epoch: 1, base: 0},
  1: {epoch: 1, base: 0}
}

function readMetaSync (metaPath: string) {
  return JSON.parse(fs.readFileSync(metaPath).toString())
}
function writeMetaSync(metaPath: string, meta: Object) {
  return fs.writeFileSync(metaPath, JSON.stringify(meta))
}

function revolutionSync (path: string, metaPath: string) {
  const size = fs.statSync(path).size
  const meta = JSON.parse(fs.readFileSync(metaPath).toString())
  fs.truncateSync(path, 0)
  meta.latest.epoch++
  meta.latest.base += size
  meta[meta.latest.epoch] = meta.latest
  writeMetaSync(metaPath, meta)
  console.log('wrote new meta')
}

export type Config = {
  logFileToAppend: string
}
export default class Log {
  config: Config
  path: string
  metaPath: string
  meta: any
  events: EventEmitter
  constructor(config: Config) {
    this.config = config
    this.path = path.resolve(process.cwd(), config.logFileToAppend)
    this.metaPath = path.resolve(process.cwd(), config.logFileToAppend + '.meta')
    this.events = new EventEmitter()

    fs.appendFileSync(this.path, '') // ensure log file exists
    if (!fs.existsSync(this.metaPath)) writeMetaSync(this.metaPath, defaultMeta)
    this.meta = readMetaSync(this.metaPath)
  }

  async write (obj: Object) {
    const buffer = new Buffer(JSON.stringify(obj) + '\n')

    return new Promise<{ok: boolean, offset: number}>((resolve) => {
      fs.appendFile(this.config.logFileToAppend, buffer, (err) => {
        if (err) throw err
        const offset = fs.statSync(this.path).size - buffer.length
        const result = Object.freeze({ok: true, offset, obj})
        resolve(result)
        this.events.emit('write', result)
      })
    })
  }

  async getFd () {
    return new Promise<number>((resolve, reject) => {
      fs.open(this.path, 'r', (err, fd) => {
        if (err) return reject(err)
        resolve(fd)
      })
    })
  }

  async getCurrentOffset (fd: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      fs.fstat(fd, (err, stats) => {
        if (err) return reject(err)
        resolve(stats.size)
      })
    })
  }

  async truncate () {
    revolutionSync(this.path, this.metaPath)
    this.meta = readMetaSync(this.metaPath)
  }

  readFromDisk (offset: number = 0, end?) {
    const stat = fs.statSync(this.path)
    const self = this
    let _offset = offset
    return Object.assign(
      fs.createReadStream(this.path, {start: offset, end})
        .pipe(split())
        .pipe(through.obj(function (chunk, enc, cb) {
          try {
            this.push({
              meta: self.meta.latest,
              offset: _offset,
              obj: JSON.parse(chunk.toString())
            })
          } finally {
            _offset += chunk.length + 1 // 1 for the \n
            cb()
          }
        })),
      {size: stat.size})
  }

  /**
   * returns a ReadableStream of objects
   */
  stream (fromSerializedOffset?: string): Readable {
    let fromOffset = 0
    let availOffset = 0
    let lastOffset = 0

    let first = this.readFromDisk(fromOffset)


    const str = new Readable({
      objectMode: true,
      read (size) {
        if (first) {
          console.log('reading from disk')
          first.on('data', data => {
            this.push(data)
          })
          first = false
        }


      }
    })

    this.events.on('write', ({offset, obj}) => {
      str.push({
        meta: this.meta.latest,
        offset,
        obj
      })
    })

    return str
  }
}

export function serializeOffset (epoch, base, offset) {
  return bs58.encode(new Buffer(JSON.stringify({epoch, base, offset})))
}
