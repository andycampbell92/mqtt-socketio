function MQTTWeb() {
	this.brokerAddress;
	this.brokerPort;
	this.fallbackAddress;
	this.fallbackPort;
	
	this.mqttClient;
	this.ioSocket;
	this.keepalive = 10000;
	
	this.FALLBACKMODE = false;
	this.DEBUG = true;
	
	if (!Function.prototype.bind) {
  		Function.prototype.bind = function (oThis) {
		    if (typeof this !== "function") {
		      // closest thing possible to the ECMAScript 5 internal IsCallable function
		      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		    }
		
		    var aArgs = Array.prototype.slice.call(arguments, 1), 
		        fToBind = this, 
		        fNOP = function () {},
		        fBound = function () {
		          return fToBind.apply(this instanceof fNOP && oThis
		                                 ? this
		                                 : oThis,
		                               aArgs.concat(Array.prototype.slice.call(arguments)));
		        };
		
		    fNOP.prototype = this.prototype;
		    fBound.prototype = new fNOP();
		
		    return fBound;
	  };
	}
}
	MQTTWeb.prototype.addBrokerAddress = function(_brokerAddress, _brokerPort){
		this.brokerAddress = _brokerAddress;
		this.brokerPort = _brokerPort;
	};
	
	MQTTWeb.prototype.addSocketIOFallback = function(_fallbackAddress, _fallbackPort){
		this.fallbackAddress = _fallbackAddress;
		this.fallbackPort = _fallbackPort;
	};
	
	MQTTWeb.prototype.connect = function(){
		// If the browser supports websockets use them else use socket.io
		// TODO FIX this code after testing
		if("WebSocket" in window){
			this.mqttClient = new Messaging.Client(this.brokerAddress, Number(this.brokerPort), "TODO REPLACE");
			this.mqttClient.onConnect = this.onConnect.bind(this);
			this.mqttClient.onConnectionLost = this.onConnect.bind(this);
			this.mqttClient.onMessageArrived = this.messageManip.bind(this);
			this.mqttClient.connect({keepAliveInterval:-1, onSuccess:this.onConnect.bind(this), onFailure:this.onError.bind(this)});
			// Setup heartbeat to keep connection alive
			window.setInterval(this.heartbeat.bind(this), this.keepalive);
		}else{
			this.FALLBACKMODE = true;
			this.ioSocket = io.connect(this.fallbackAddress + ':' + this.fallbackPort);
			this.ioSocket.on('connect', this.connectionSetup.bind(this));
		}
	};
	
	MQTTWeb.prototype.heartbeat = function(){
		this.publish("heartbeatzzzzz", "keep alive");
	};
	
	MQTTWeb.prototype.connectionSetup = function(){
		this.ioSocket.on('mqtt', this.onMessage.bind(this));
		this.onConnect();
	};
	
	MQTTWeb.prototype.onConnect = function(){
		console.log(this);
		if(this.DEBUG){
			if(this.FALLBACKMODE){
				console.log("connected: " + this.fallbackAddress + ':' + this.fallbackPort);
			}else{
				console.log("connected: " + this.brokerAddress + ':' + this.brokerPort);
			}
		}
	};
	
	MQTTWeb.prototype.onError = function(){
		if(this.DEBUG){
			console.log("connection error");
		}
	};
	
	MQTTWeb.prototype.subscribe = function(_topic){
		if(this.FALLBACKMODE){
			this.ioSocket.emit('subscribe', {topic: _topic});
			if(this.DEBUG){
				console.log("subscribed: " + _topic);
			}
		}else{
			this.mqttClient.subscribe(_topic);
			if(this.DEBUG){
				console.log("subscribed: " + _topic);
			}
		}
	};
	
	MQTTWeb.prototype.publish = function(_topic, _message){
		if(this.FALLBACKMODE){
			this.ioSocket.emit('publish', {topic:_topic, message:_message});
			if(this.DEBUG){
				console.log("publishing: " + _topic + ' - ' + _message);
			}
		}else{
			var message = new Messaging.Message(_message);
			message.destinationName = _topic;
			this.mqttClient.send(message);
			if(this.DEBUG){
				console.log("publishing: " + _topic + ' - ' + _message);
			}
		}
	};
	
	MQTTWeb.prototype.unsubscribe = function(_topic){
		if(this.FALLBACKMODE){
			this.ioSocket.emit('unsubscribe', {topic:_topic});

		}else{
			this.mqttClient.unsubscribe(_topic);
		}
		if(this.DEBUG){
			console.log("unsubscribed: " + _topic);
		}
	};
	
	MQTTWeb.prototype.messageManip = function(_message){
		this.onMessage({topic:_message.destinationName, message:_message.payloadString});
	};
	
	MQTTWeb.prototype.onMessage = function(_message){
		if(this.DEBUG){
			console.log(_message.topic + ": " + _message.message);
		}
	};
	
