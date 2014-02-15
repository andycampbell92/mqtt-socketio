MQTTWeb = (function(global) {
	var brokerAddress;
	var brokerPort;
	var fallbackAddress;
	var fallbackPort;
	
	var ioSocket;
	
	var FALLBACKMODE = false;
	var DEBUG = true;
	
	var addSocketIOFallback = function(_fallbackAddress, _fallbackPort){
		fallbackAddress = _fallbackAddress;
		fallbackPort = _fallbackPort;
	};
	
	var connect = function(){
		// If the browser supports websockets use them else use socket.io
		// TODO FIX this code after testing
		if("___WebSocket" in window){
			console.log("Websocket support");
		}else{
			FALLBACKMODE = true;
			ioSocket = io.connect(fallbackAddress + ':' + fallbackPort);
			ioSocket.on('connect', connectionSetup);
		}
	};
	
	var connectionSetup = function(){
		ioSocket.on('mqtt', onMessage);
		onConnect();
	};
	
	var onConnect = function(){
		if(DEBUG){
			if(FALLBACKMODE){
				console.log("connected: " + fallbackAddress + ':' + fallbackPort);
			}else{
				console.log("connected: " + brokerAddress + ':' + brokerPort);
			}
		}
	};
	
	var subscribe = function(_topic){
		if(FALLBACKMODE){
			ioSocket.emit('subscribe', {topic: _topic});
			if(DEBUG){
				console.log("subscribed: " + _topic);
			}
		}
	};
	
	var publish = function(_topic, _message){
		if(FALLBACKMODE){
			ioSocket.emit('publish', {topic:_topic, message:_message});
			if(DEBUG){
				console.log("publishing: " + _topic + ' - ' + _message);
			}
		}
	};
	
	var unsubscribe = function(_topic){
		if(FALLBACKMODE){
			ioSocket.emit('unsubscribe', {topic:_topic});
			if(DEBUG){
				console.log("unsubscribed: " + _topic);
			}
		}
	};
	
	var onMessage = function(_message){
		if(DEBUG){
			if(FALLBACKMODE){
				console.log(_message.topic + ": " + _message.message);
			}
		}
	};
	
	return {
		'connect': connect,
		'onConnect': onConnect,
		'addSocketIOFallback': addSocketIOFallback,
		'subscribe': subscribe,
		'publish': publish,
		'unsubscribe': unsubscribe,
		'onMessage': onMessage
	};
});
