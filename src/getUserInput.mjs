import readlinePromises from 'node:readline/promises';

const newInterface = readlinePromises.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export default async function (question) {
  const answer = await newInterface.question(question);

  console.log('The input filepath is: ', answer);

  return answer;
};
