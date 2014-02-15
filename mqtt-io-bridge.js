var sys = require('sys');
var net = require('net');
var mqtt = require('mqtt');
 
var io  = require('socket.io').listen(5000);
var client = mqtt.createClient(1883, 'test.mosquitto.org');
 
io.sockets.on('connection', function (socket) {
  socket.on('subscribe', function (data) {
    console.log('Subscribing to '+data.topic);
    socket.join(data.topic);
    client.subscribe(data.topic);
  });
  
  socket.on('publish', function(data){
  	console.log('Publishing ' + data.message + ' to '+data.topic);
  	client.publish(data.topic, data.message);
  });
  
  socket.on('unsubscribe', function(data){
  	console.log('Unsubscribing from '+data.topic);
  	socket.leave(data.topic);
  	client.unsubscribe(data.topic);
  });
});


 
client.on('message', function(topic, message){
	io.sockets.in(topic).emit('mqtt',{'topic': String(topic), 'message':String(message)});
});

var connect = require('connect');
connect.createServer(
    connect.static(__dirname)
).listen(8080);