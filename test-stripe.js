// Simple test script to verify Stripe integration
const https = require('https');
const querystring = require('querystring');

// Test the /api/subscribe endpoint
const testSubscribe = () => {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({});
    
    const options = {
      hostname: 'trustmarch.com',
      path: '/api/subscribe',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
};

// Run the test
testSubscribe()
  .then((response) => {
    console.log('Status Code:', response.statusCode);
    console.log('Response:', response.body);
  })
  .catch((error) => {
    console.error('Error:', error);
  });