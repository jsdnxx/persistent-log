# persistent-log

this is a simple demo of an append-only log with writes committed to disk.
it is meant to be used in development in place of something more robust, like kafka.
please don't use this in anything close to a production environment.

## example: LogService
```console
$ npm run start:example:service
$ curl -X POST -H 'content-type: application/json' localhost:9977/ -d '{"hi": 1}' -v

*   Trying ::1...
* Connected to localhost (::1) port 9977 (#0)
> POST / HTTP/1.1
> Host: localhost:9977
> User-Agent: curl/7.43.0
> Accept: */*
> content-type: application/json
> Content-Length: 9
>
* upload completely sent off: 9 out of 9 bytes
< HTTP/1.1 201 Created
< X-Powered-By: Express
< Content-Type: application/json; charset=utf-8
< Content-Length: 64
< ETag: W/"40-qpDxi75u8g5HJ8fQPeX62w"
< Date: Wed, 21 Dec 2016 12:03:58 GMT
< Connection: keep-alive
<
* Connection #0 to host localhost left intact
{"offset":"58MiJffLSHP9EshHZ1Y9Nk79nd3mTczfqn7t8BPyLWk5yq1dRx8"}
```

## readme updates to come