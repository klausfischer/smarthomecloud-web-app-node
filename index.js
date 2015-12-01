var express = require('express');
var app = require('./app');

var port = process.env.PORT || '3000';
app.set('port', port);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});