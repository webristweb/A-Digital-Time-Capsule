const BLOCKCHAIN_KEY = 'timevault_blockchain';

function getChain() {
  return JSON.parse(localStorage.getItem(BLOCKCHAIN_KEY) || '[]');
}

function addBlock(metadataHash) {
  const chain = getChain();
  const block = {
    index: chain.length,
    timestamp: new Date().toISOString(),
    metadataHash,
    prevHash: chain.length ? chain[chain.length-1].blockHash : '0',
  };
  block.blockHash = sha256Sync(JSON.stringify(block));
  chain.push(block);
  localStorage.setItem(BLOCKCHAIN_KEY, JSON.stringify(chain));
  return block;
}

function sha256Sync(str) {
  // Synchronous SHA-256 for blockchain hash (not secure, for demo)
  // Simple hash for demo only
  let hash = 0, i, chr;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(16);
}

window.Blockchain = { getChain, addBlock }; 