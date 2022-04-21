const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const { NOISE } = require('libp2p-noise')
const MPLEX = require('libp2p-mplex')
const WebSockets = require('libp2p-websockets')

const createNode = async (transports, addresses = []) => {
    if (!Array.isArray(addresses)) {
        addresses = [addresses]
      }
    
  const node = await Libp2p.create({
    addresses: {
      listen: addresses
    },
    modules: {
      transport: transports,
      connEncryption: [NOISE],
      streamMuxer: [MPLEX]
    }
  })

  await node.start()
  return node
}

function printAddrs (node, number) {
    console.log('node %s is listening on:', number)
    node.multiaddrs.forEach((ma) => console.log(ma.toString()))
  }

function print ({ stream }) {
    console.log('stream: ', stream)
}

;(async () => {
    const [node1, node2, node3] = await Promise.all([
        createNode([TCP], '/ip4/0.0.0.0/tcp/0'),
        createNode([TCP,WebSockets], ['/ip4/0.0.0.0/tcp/0', '/ip4/127.0.0.1/tcp/10000/ws']),
        createNode([WebSockets], '/ip4/127.0.0.1/tcp/20000/ws')
      ])
    
      printAddrs(node1, '1')
      printAddrs(node2, '2')
      printAddrs(node3, '3')

      node1.handle('/print', print)
      node2.handle('/print', print)
      node3.handle('/print', print)

    await node1.peerStore.addressBook.set(node2.peerId, node2.multiaddrs)
    await node2.peerStore.addressBook.set(node3.peerId, node3.multiaddrs)
    await node3.peerStore.addressBook.set(node1.peerId, node1.multiaddrs)

    await node1.dialProtocol(node2.peerId, '/print')
    await node2.dialProtocol(node3.peerId, '/print')
    
    try {
        await node3.dialProtocol(node1.peerId, '/print')
      } catch (err) {
        console.log('node 3 failed to dial to node 1 with:', err.message)
      }

  })();