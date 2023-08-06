const string = '183.84.80.34:16555;fD:68:14:0A:e4:aa;185.193.185.226:14312;d0:4a:bA:cE:D5:9;true;473;0.000416';

// const rexex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d+)$/;

const isRowValid = (row) => {
  if (row.split(';').length !== 7) {
    console.log('INVALID LENGTH')
    return false;
  }

  const [
    sourceIpPort,
    sourceMac,
    targetIpPort,
    targetMac,
    isUDP,
    dataSize,
    transferTime,
  ] = row.split(';');

  const ipPortRegex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d+)$/;
  if (!ipPortRegex.test(sourceIpPort) || !ipPortRegex.test(targetIpPort)) {
    console.log('INVALID ipPOrt')
    return false;
  }

  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  if (!macRegex.test(sourceMac) || !macRegex.test(targetMac)) {
    console.log('INVALID MAC')
    return false;
  }

  if (isUDP !== 'true' && isUDP !== 'false') {
    console.log('INVALID PROTOCOL')
    return false;
  }

  if (isNaN(dataSize) || isNaN(transferTime) || dataSize < 0 || transferTime < 0) {
    console.log('INVALID number')
    return false;
  }

  return true;

};

console.log('answer: ', isRowValid(string));