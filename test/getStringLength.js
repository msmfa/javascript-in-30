const testArray = [
  {
    title: "variables",
    text:
      "Variables can be denoted with the keywords let or const. The accepted convention is to use const as much as possible, and let when the variable is likely to be re-assigned",
    bulletPointItems: "",
    image: "IMG/variable.png",
  },
];
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
const amount = getWordCount(testArray);
const numOver30 = amount.filter((item) => {
  if (item > 30) return item;
}).length;

module.exports = numOver30;
