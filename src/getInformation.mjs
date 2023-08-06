const isRowValid = (row) => {
  if (row.split(';').length !== 7) {
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
    return false;
  }

  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  if (!macRegex.test(sourceMac) || !macRegex.test(targetMac)) {
    return false;
  }

  if (isUDP.toLowerCase() !== 'true' && isUDP.toLowerCase() !== 'false') {
    return false;
  }

  if (isNaN(dataSize) || isNaN(transferTime) || dataSize < 0 || transferTime < 0) {
    return false;
  }

  return true;

};


const getUniqIpWithProtocol = (arr) => {
  return [...new Set(
    arr.map(({ip, protocol}) => `${ip}|${protocol}`)
  )];
};

export default function (input) {
  const rows = input.split('\n');

  const validRows = rows.filter((row) => isRowValid(row));

  const uniqIps = new Set;
  let sumDataSize = 0;
  let sumTransfertime = 0;
  const udpSpeeds = new Set;
  const tcpSpeeds = new Set;
  const nodesBySpeed = {};
  const subnetByActivity = {};
  const nodeRelations = {};

  for (const row of validRows) {
    const [
      sourceIpPort,
      sourceMac,
      targetIpPort,
      targetMac,
      isUDP,
      dataSize,
      transferTime,
    ] = row.split(';');

    const sourceIp = sourceIpPort.split(':')[0];
    const targetIp = targetIpPort.split(':')[0];
    const sourceSubnet = sourceIp.substring(0, sourceIp.lastIndexOf('.'));
    uniqIps.add(sourceIp);
    uniqIps.add(targetIp);

    if (!(sourceIp in nodeRelations)) {
      nodeRelations[sourceIp] = {
        to: [],
        from: [],
      };
    }
    if (!(targetIp in nodeRelations)) {
      nodeRelations[targetIp] = {
        to: [],
        from: [],
      };
    }

    nodeRelations[sourceIp].to.push({
      ip: targetIp,
      protocol: isUDP === 'true' ? 'UDP' : 'TCP',
    });

    nodeRelations[targetIp].from.push({
      ip: sourceIp,
      protocol: isUDP === 'true' ? 'UDP' : 'TCP',
    });

    if (!(sourceSubnet in subnetByActivity)) {
      subnetByActivity[sourceSubnet] = 0;
    }

    subnetByActivity[sourceSubnet] += 1;

    const dataSizeNumber = Number(dataSize);
    const transferTimeNumber = Number(transferTime);

    sumDataSize += dataSizeNumber;
    sumTransfertime += transferTimeNumber;

    const transferSpeed = (dataSizeNumber / transferTimeNumber).toFixed(4);

    if (!(sourceIp in nodesBySpeed)) {
      nodesBySpeed[sourceIp] = [];
    }

    nodesBySpeed[sourceIp].push(Number(transferSpeed));
    nodesBySpeed[sourceIp].sort((a, b) => b - a);

    if (isUDP.toLowerCase() === 'true') {
      udpSpeeds.add(transferSpeed);
    } else {
      tcpSpeeds.add(transferSpeed);
    }
  }

  const sortedNodesBySpeed = Object.entries(nodesBySpeed)
    .map(([ip, speeds]) => {
      return {
        ip,
        averageSpeed: speeds.reduce((acc, item) => acc + item, 0) / speeds.length,
      }
    })
    .sort((a, b) => b.averageSpeed - a.averageSpeed)
    .slice(0, 10)
    .map(({ ip, averageSpeed }) => `${ip} - ${averageSpeed}(б/с)`)
    .join(',\n\t');

  const sortedSubnetsByActivity = Object.entries(subnetByActivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ip, count]) => `${ip} - ${count}(шт)`)
    .join(',\n\t');

  const possibleProxies = Object.entries(nodeRelations)
    .reduce((proxies, [ip, { to, from }]) => {
      if (!to.length || !from.length) {
        return proxies;
      }

      if (
          to.length < 2 
          || from.length < 2
          || getUniqIpWithProtocol(to).length < 2
          || getUniqIpWithProtocol(from).length < 2
        ) {
        return proxies;
      }

      let connectionCount = 0;

      const uniqTo = getUniqIpWithProtocol(to);
      const uniqFrom = getUniqIpWithProtocol(from);

      uniqTo.forEach((item) => {
        if (uniqFrom.includes(item)) {
          connectionCount += 1;
        }
      })

      if (connectionCount < 2) {
        return proxies;
      }

      return [...proxies, ip];

    }, [])
    .join(',\n\t');

  return {
    uniqNodes: uniqIps.size,
    averageSpeed: Number((sumDataSize / sumTransfertime).toFixed(4)),
    udpInfo: Math.max(...Array.from(udpSpeeds)) > Math.max(...Array.from(tcpSpeeds)),
    nodesWithHighAverageSpeed: sortedNodesBySpeed,
    activeSubnets: sortedSubnetsByActivity,
    proxies: possibleProxies,
  };
};
