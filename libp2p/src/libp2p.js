const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const { NOISE } = require('libp2p-noise')
const MPLEX = require('libp2p-mplex')
const KadDHT = require('libp2p-kad-dht')
const Gossipsub = require('libp2p-gossipsub')

module.exports = function () {
  this.createNode = async () => {
    const node = await Libp2p.create({
      addresses: {
        listen: ['/ip4/0.0.0.0/tcp/0']
      },
      modules: {
        transport: [TCP],
        connEncryption: [NOISE],
        streamMuxer: [MPLEX],
        dht: KadDHT,
        pubsub: Gossipsub
      },
      config: {
        dht: {
          enabled: true
        }
      }
    })
    return node
  }
}