const libp2p = require('./libp2p');
const delay = require('delay')

async function run () {
  const Libp2p = new libp2p();

  const [node1, node2, node3, node4] = await Promise.all([
    Libp2p.createNode(),
    Libp2p.createNode(),
    Libp2p.createNode(),
    Libp2p.createNode()
  ])

  await node1.start()
  await node2.start()
  await node3.start()
  await node4.start()

  await node1.peerStore.addressBook.set(node2.peerId, node2.multiaddrs)
  await node2.peerStore.addressBook.set(node3.peerId, node3.multiaddrs)
  await node3.peerStore.addressBook.set(node4.peerId, node4.multiaddrs)

  delay(100)

  const topic = 'node_news';

  node1.pubsub.subscribe(topic)
  node1.pubsub.on(topic, (message) => {
    console.log(`[Node 1] received:\t ${Buffer.from(message.data).toString()}`)
  })

  node2.pubsub.subscribe(topic)
  node2.pubsub.on(topic, (message) => {
    console.log(`[Node 2] received:\t ${Buffer.from(message.data).toString()}`)
  })

  node3.pubsub.subscribe(topic)
  node3.pubsub.on(topic, (message) => {
    console.log(`[Node 3] received:\t ${Buffer.from(message.data).toString()}`)
  })

  node4.pubsub.subscribe(topic)
  node4.pubsub.on(topic, (message) => {
    console.log(`[Node 4] received:\t ${Buffer.from(message.data).toString()}`)
    
  })

  setInterval(() => {
    try {
      node1.pubsub.publish(topic, new Uint8Array(Buffer.from("Node 1 says: Hi!")))
    } catch (error) {
      console.log(error)
    }
  }, 5000)

  setInterval(() => {
    try {
      node4.pubsub.publish(topic, new Uint8Array(Buffer.from("Node 4 says: Hi!")))
    } catch (error) {
      console.log(error)
    }
  }, 10000)
}

run()