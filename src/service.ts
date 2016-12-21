import * as express from 'express'
import Log, {serializeOffset} from './'
import * as through from 'through2'
import * as concat from 'concat-stream'

export default class LogService {
  app: express.Express
  private log: Log

  constructor (port: number, logPath: string) {
    this.app = express()

    this.log = new Log({logFileToAppend: logPath})

    this.setupRoutes()

    this.app.listen(port, () => {
      console.log('listening on http://127.0.0.1:' + port)
    })
  }

  private setupRoutes () {

    this.app.get('/tail', (req, res) => {
      this.log.stream()
        .pipe(through.obj(function (chunk, enc, cb) {
          const offset = serializeOffset(chunk.meta.epoch, chunk.meta.base, chunk.offset)
          this.push(JSON.stringify({offset, obj: chunk.obj}) + '\n')
          cb()
        }))
        .pipe(res)
    })

    this.app.post('/', (req, res) => {
      if (req.headers['content-type'] !== 'application/json') {
        res.status(406)
        return res.end()
      }
      console.log('init post')
      req.pipe(concat((body) => {
        let json
        try {
          json = JSON.parse(body.toString())
        } catch (e) {
          res.status(400)
          return res.end()
        }

        return this.log.write(json)
          .then(write => {
            console.log('wrote', write)
            const offset = serializeOffset(this.log.meta.latest.epoch, this.log.meta.latest.base, write.offset)
            res.status(201).json({offset})
          })
          .catch(e => {
            console.log('error', e)
            res.status(500)
            res.end()
          })
      }))
    })

  }

}