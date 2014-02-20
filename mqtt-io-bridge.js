var sys = require('sys');
var net = require('net');
var ascoltatori = require('ascoltatori');
settings = {
  type: 'mqtt',
  json: false,
  mqtt: require('mqtt'),
  host: '<INSERT_BROKER_ADDRESS>',
  port: <INSERT_BROKER_PORT>
};

var io  = require('socket.io').listen(<INSERT_SOCKET_IO_PORT>);

ascoltatori.build(settings, function (ascoltatore) {
	io.sockets.on('connection', function (socket) {
		socket.on('subscribe', function (data) {
			console.log('Subscribing to '+data.topic);
			socket.join(data.topic);
			ascoltatore.subscribe(data.topic, function() {
				io.sockets.in(data.topic).emit('mqtt',{'topic': String(arguments['0']), 'message':String(arguments['1'])});
			});
		});
		socket.on('publish', function(data){
			console.log('Publishing ' + data.message + ' to '+data.topic);
			ascoltatore.publish(data.topic, data.message);
		});
		  
		socket.on('unsubscribe', function(data){
			console.log('Unsubscribing from '+data.topic);
			socket.leave(data.topic);
			ascoltatore.unsubscribe(data.topic);
		});
	});
});