var express = require('express');
var app = express();

app.get('/', function(req, res){
  res.send('hello world');
  console.log('Hello world');
});

app.listen(3000);
console.log('Server running at http://127.0.0.1:3000/');