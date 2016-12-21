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

$ curl localhost:9977/tail -v
*   Trying ::1...
* Connected to localhost (::1) port 9977 (#0)
> GET /tail HTTP/1.1
> Host: localhost:9977
> User-Agent: curl/7.43.0
> Accept: */*
>
< HTTP/1.1 200 OK
< X-Powered-By: Express
< Date: Wed, 21 Dec 2016 12:15:26 GMT
< Connection: keep-alive
< Transfer-Encoding: chunked
<
{"offset":"2suEo7QKG2FT5xu4btqHtEPUTD4tsjantUdBLkngtDJ","obj":{"hi":1}}
{"offset":"2suEo7QKG2FT5xu4btqHtEPUTD4tsjantUdBLkngtu2","obj":{"hi":1}}
{"offset":"9HfZtXFubJWn8uinu1n9X86CAgGBxvx9YCvgeCGf3HXa","obj":{"hi":1}}
{"offset":"9HfZtXFubJWn8uinu1n9X86CAgGBxvx9YCvgeCGf3cw6","obj":{"hi":1}}
{"offset":"9HfZtXFubJWn8uinu1n9X86CAgGBxvx9YCvgeCGf3xLc","obj":{"hi":1}}
^C

$ curl 127.0.0.1:9977/truncate -X POST -v
*   Trying 127.0.0.1...
* Connected to 127.0.0.1 (127.0.0.1) port 9977 (#0)
> POST /truncate HTTP/1.1
> Host: 127.0.0.1:9977
> User-Agent: curl/7.43.0
> Accept: */*
>
< HTTP/1.1 200 OK
< X-Powered-By: Express
< Date: Wed, 21 Dec 2016 12:15:54 GMT
< Connection: keep-alive
< Content-Length: 0
<
* Connection #0 to host 127.0.0.1 left intact

$ curl localhost:9977/tail?from=3nT7F6WwLbfqxMBcPGXUPzpSJfC6b5u6mB4GwVxHZLUiZgp -v
*   Trying ::1...
* Connected to localhost (::1) port 9977 (#0)
> GET /tail?from=3nT7F6WwLbfqxMBcPGXUPzpSJfC6b5u6mB4GwVxHZLUiZgp HTTP/1.1
> Host: localhost:9977
> User-Agent: curl/7.43.0
> Accept: */*
>
< HTTP/1.1 200 OK
< X-Powered-By: Express
< Date: Wed, 21 Dec 2016 12:29:00 GMT
< Connection: keep-alive
< Transfer-Encoding: chunked
<
{"offset":"3nT7F6WwLbfqxMBcPGXUPzpSJfC6b5u6mB4GwVxHZLUiZgp","obj":{"hi":3}}
```

## readme updates to come