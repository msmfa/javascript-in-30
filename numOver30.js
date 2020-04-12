import { definitions } from "./data.js";

const defCopy = [...definitions];
const bothText = defCopy.map((item) => item.text + item.bulletPointItems);

function getWordCount(array) {
  let wordCountarr = [];

  for (let i = 0; i < array.length; i++) {
    if (array[i] === undefined) return;
    //cannot use .trim on an undefined string
    const wordLength = array[i].trim().split(" ").length;
    wordCountarr.push(wordLength);
  }
  return wordCountarr;
}

const amount = getWordCount(bothText);

const numOfOver30 = amount.filter((item) => {
  if (item > 30) return item;
}).length;

module.exports.numOfOver30 = numOfOver30;
