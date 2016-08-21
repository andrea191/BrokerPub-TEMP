//CONTROLLER
var mosca = require('mosca');
var mqtt = require('mqtt');
var redis = require('redis');
var sensor = require('ds18x20');
var os = require('os');

//Specs
var numberGateway = 2;
var numberFailure = 1;
var logCounter = 0;

//HOSTNAME
var gateway_id = os.hostname();
console.log(gateway_id);

// ++ BROKER DEFINITION ++ \\
var pubsubSettings = {
    type: 'redis',
    host: "localhost",
    port: 6379,
    db: 12,
    return_buffers: true
};
var persistenceSettings = {
  //persistence for offline messages feature 
  //(if the connection goes down)
  factory: mosca.persistence.Redis,
  port: 6379,
  host: "localhost"
};
var settings = {
  id: gateway_id, // used to publish in the $SYS/<id> topicspace
  port: 1883, 
  stats: true, // publish stats in the $SYS/<id> topicspace
  backend: pubsubSettings, //ASCOLTATORE DEFINITION
  persistence: persistenceSettings //PERSISTANCE DEFINITION
};

console.log("sono quas")
var server = new mosca.Server(settings, function() {
  console.log('Mosca server is up and running')
});
console.log("ora quas")
//Discovering sensor on Gateway
if (sensor.isDriverLoaded()){
  console.log('Temperature driver loaded');
  var listOfDeviceIds = sensor.list();
  console.log(listOfDeviceIds);  
  var serial_temp = listOfDeviceIds[0];
}


//ANY x MILLISECONDS FETCH DATA TEMPERATURE FROM SENSOR AND PUBLISH DATA
setInterval(dataMessage, 5000);
function dataMessage() {
  var data = {
    'temperature': 0, //to test on laptop
    'timestamp': Date(),
    'log': logCounter
  };
  if (serial_temp){ //to test on RPi with sensor.
    data['temperature'] = sensor.get(serial_temp);
  }

  console.log(data);
  console.log(typeof data);
  var data_string = JSON.stringify(data);
  console.log(data_string);
  console.log(typeof data_string);

  var message = {
        topic: '/'+gateway_id+'/temperature/TEMP001',
        payload: data_string, // String or a Buffer
        qos: 1, // 0, 1, or 2
        retain: false // or true
      };
  server.publish(message, function() {
    console.log('## -- Packet sent -- ##');
    //console.log(message);
    console.log(message['topic']);
    console.log(message['payload'].toString());
    console.log('## -- ########### -- ##');
  });
  logCounter++;
}

//------------------------\\

server.on('published',function(packet, client) {
  //client is null, because the broker itself published the message
  /*
  console.log('## -- NEW PACKET -- ##');
  console.log(packet['topic']);
  console.log(packet['payload'].toString());
  console.log('######################');
  */
});
 
server.on('clientConnected', function(client){
  console.log(client);
  console.log('Client Connected:', client.id)

});

server.on('clientDisconnected', function(client){
  console.log('Client Disconnected:', client.id)
});

/*
  var message = {
        topic: '/sensor/temperature',
        payload: packet['payload'].toString(), // or a Buffer
        qos: 1, // 0, 1, or 2
        retain: true // or true
      };
      server.publish(message, function() {
        console.log('## -- SENSOR LIST UPDATED -- ##');
      });
*/