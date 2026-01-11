const http = require('http');

const data = JSON.stringify({
  TrackingId: 'NODE123',
  CustomerName: 'Node Poster',
  CustomerContact: 5551234567,
  CustomerAddress: 'Node St',
  Amount: 42,
  Type: 'COD',
  Note: 'Posted from node script',
  Status: 'Pending'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', JSON.stringify(res.headers));
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('BODY:', body);
  });
});

req.on('error', (e) => {
  console.error('problem with request:', e.message);
});

req.write(data);
req.end();
