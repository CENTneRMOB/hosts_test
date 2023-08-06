#!/usr/bin/env node

import { exit } from 'node:process'
import readFile from './src/readFile.mjs';
import getUserInput from './src/getUserInput.mjs';
import getInformation from './src/getInformation.mjs';

const question = 'Specify the absolute path to the file\n';

const main = async () => {
  try {
    const answer = await getUserInput(question);
    const inputData = await readFile(answer);
    const information = getInformation(inputData);
  
    const {
      uniqNodes,
      averageSpeed,
      udpInfo,
      nodesWithHighAverageSpeed,
      activeSubnets,
      proxies,
    } = information;
  
    console.log(`
    1. Уникальных узлов в наблюдаемой сети(шт): ${uniqNodes},
    2. Cредняя скорость передачи данных всей наблюдаемой сети(байт/сек): ${averageSpeed},
    3. Используется ли UDP для передачи данных с максимальной пиковой скоростью: ${udpInfo ? 'Да' : 'Нет'},
    4. 10 узлов сети с самой высокой средней скоростью передачи данных(байт/сек):\n\t ${nodesWithHighAverageSpeed},
    5. 10 самых активных подсетей по критерию количества сессий передачи данных(шт):\n\t ${activeSubnets},
    6. PROXY узлы: ${proxies.length ? proxies : 'Отсутствуют'},
    `);
    
    exit();
  } catch (error) {
    throw new Error(error);
  };
};

main();
