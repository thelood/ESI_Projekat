const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const { NOISE } = require('libp2p-noise')
const MPLEX = require('libp2p-mplex')
const KadDHT = require('libp2p-kad-dht')
const delay = require('delay')
const Gossipsub = require('libp2p-gossipsub')


const createNode = async () => {
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


;(async () => {
  const topic = 'nodes_topic'
    const [node1, node2, node3] = await Promise.all([
        createNode(),
        createNode(),
        createNode()
      ])
    
    await node1.start()
    await node2.start()
    await node3.start()

    await node1.peerStore.addressBook.set(node2.peerId, node2.multiaddrs)
    await node2.peerStore.addressBook.set(node3.peerId, node3.multiaddrs)

    await Promise.all([
      node1.dial(node2.peerId),
      node2.dial(node3.peerId)
    ])

    await delay(100)
    await node1.peerRouting.findPeer(node3.peerId)
    
    node3.pubsub.subscribe(topic)
    node3.pubsub.on(topic, (message) => {
      let str = Buffer.from(message.data).toString();
      console.log(`node3 received: ${str}`)
      
    })


    setInterval(() => {
      let uint8arr = new Uint8Array(Buffer.from("david"));
      node1.pubsub.publish(topic, uint8arr)
    }, 1000)
  })();