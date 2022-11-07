#!/usr/env node
const { Socket } = require('node:net');

const s = new Socket();

s.on('connect', () => {
  s.write(Buffer.from(
    'GET /v1/projects/1/forms/all-widgets.svc/Submissions HTTP/1.1\r\n' +
    'Host: localhost:8989\r\n' +
    'User-Agent: curl/7.68.0\r\n' +
    'Accept: */*\r\n' +
    'Authorization: Basic eEBleGFtcGxlLmNvbTpzZWNyZXQ=\r\n' +
    '\r\n' +
  '', 'ascii'));
});
s.on('data', data => console.log('RECEIVED:', data.toString()));

s.connect('8989', 'localhost');
s.pause();
