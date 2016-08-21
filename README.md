#Gateway 

##MQTT Broker 
Publish the temperature value on the following topic:

/hostname_machine/temperature/TEMP001

The MQTT client will subscribe to two topics, where only the hostname_machine will be different,
i.e. 'GW000' and 'GW111'.

###Temperature sensor
DS18B20X
