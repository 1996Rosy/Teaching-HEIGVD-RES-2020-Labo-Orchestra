
/*
 * We have defined the multicast address and port in a file, that can be imported by
 * musician.js. The address and the port are part of our simple 
 * application-level protocol
 */
const protocol = require('./musician-protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');

/* 
 * We use a standard Node.js module for the creation of RFC4122 UUIDs
 */
const uuidv4 = require('uuid/v4');

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by thermometers and containing measures
 */
const socket = dgram.createSocket('udp4');

/* 
 * We create a map with the instruments associated to their sounds  
 */
const instrumentSoundMap = {
  piano: 'ti-ta-ti',
  trumpet: 'pouet',
  flute: 'trulu',
  violin: 'gzi-gzi',
  drum: 'boum-boum',
};

function Musician(instrument) {
  this.instrument = instrument;
  this.sound = instrumentSoundMap[instrument];
  this.uuid = uuidv4();

 /*
  * We will simulate instrument changes on a regular basis. That is something that
  * we implement in a class method (via the prototype)
  */
  Musician.prototype.update = function() {


  /* Let's create the measure as a dynamic javascript object, 
   * add the 3 properties (uuid, instrument and sound)
   * and serialize the object to a JSON string
   */
    const music = {
      uuid: this.uuid,
      instrument: this.instrument,
      sound: this.sound,
    };
    const payload = JSON.stringify(music);


  /*
   * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
   * the multicast address. All subscribers to this address will receive the message.
   */
    const message = Buffer.from(payload);
    socket.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
	console.log("Sending payload: " + payload + " via port " + socket.address().port);
    });
  };

  /*
   * Let's take and send a measure every 500 ms
   */
   setInterval(this.update.bind(this), 500);
}

/*
 * Let's get the musician properties from the command line attributes
 * Some error handling wouln't hurt here...But I just won't do it.. :D
 */
const instrument = process.argv[2];

/*
 * Let's create a new musician - the regular publication of sounds produced will
 * be initiated within the constructor
 */
const m1 = new Musician(instrument);



