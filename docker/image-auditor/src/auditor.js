
const moment = require('moment');
const net = require('net');
const protocol = require('./musician-protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by thermometers and containing measures
 */
const s = dgram.createSocket('udp4');
s.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

const orchestra = new Map();


/* 
 * This call back is invoked when a new datagram has arrived.
 */
s.on('message', function(msg, source) {
  console.log("Data has arrived: " + msg + ". Source port: " + source.port);
  
  const musician = JSON.parse(msg);

  if (orchestra.has(musician.uuid)) {
    orchestra.get(musician.uuid).last_sound = moment().toISOString();
  } else {
    orchestra.set(musician.uuid, {
      instrument: musician.instrument,
      first_sound: moment().toISOString(),
      last_sound: moment().toISOString(),
    });
  }
});
 
  
/**
 * We implement a small TCP server and we write the information about who is currently playing
 * 
 */
const TCP_Server = net.createServer();
TCP_Server.listen(protocol.PROTOCOL_PORT);
TCP_Server.on('connection', (TCP_Socket) => {
  const payload = [];
  orchestra.forEach((value, key) => {
    //A musician is active if it has played a sound during the last 5 seconds.
    if (moment().diff(value.lastSound, 'seconds') <= 5) {
      const item = {
        uuid: key,
        instrument: value.instrument,
        activeSince: value.first_sound,
      };
      payload.push(item);
    } else orchestra.delete(key); //We get rid of the inactive player
  });

  TCP_Socket.write(JSON.stringify(payload) + '\r\n');
  TCP_Socket.end();
});
