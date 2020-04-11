const listContainer = document.querySelector(".list-container");

const definitions = [
  //Items displayed in a bullet point style must be inluded in the bullet point property
  {
    title: "variables",
    text:
      "Variables are containers that hold reusable data. The accepted convention is to use const as much as possible, and let when the variable is likely to be re-assigned",
  },
  {
    title: "data-types",
    text: "There are six basic data types in JavaScript:",
    bulletPointItems: "String. Number. Boolean. Array. Object. Function.",
  },
  {
    title: "scope",
    text:
      "Scope refers to the current context of code, which determines the accessibility of variables to JavaScript. The two types of scope are local and global",
    imgFile: "",
  },
  {
    title: "functions",
    text:
      "A function is a set of instructions for Javascript to implement. It consists of the function keyword followed by:",
    bulletPointItems:
      "The name of the function. A list of parameters to the function. The statements that define the function.",
  },
  {
    title: "for-loops",
    text: `A for loop creates a loop with three optional expressions; enclosed in parentheses and separated by semicolons, followed by a statement (usually a block statement) to be executed within the loop.`,
  },
  {
    title: "while-loops",
    text: `A while loop loops through a block of code "while" the condition is true.`,
  },
  {
    title: "switch-statements",
    text: `A switch statement is used as an alternative to multiple if .. else statements. Switch statements are a more efficient way to code when testing multiple conditions.`,
  },
  {
    title: "arrow-functions",
    text: `A concise syntax for creating functions.
    If we have only one argument, then parentheses around parameters can be omitted. 
    `,
    bulletPointItems: "Arrow functions do not have a 'this' context.",
  },
  {
    title: "functional-expressions",
    text: `Function expressions load only when the interpreter reaches that line of code. 
    They're not hoisted, allowing them to retain a copy of the local variables from 
    the scope where they were defined. They do not polute the global scope.
    `,
  },
  {
    title: "array-methods",
    bulletPointItems: `forEach() -  loop over array's items. map() - new array by calling the provided function in every element. filter() - new array with only elements that pass the condition. 
    `,
  },
  {
    title: "operators",
    bulletPointItems:
      "+ Addition. - Subtraction. * Multiply. / Divide. % Modulus. ++ Increment. -- Decrement.",
  },
  {
    title: "comparisons",
    bulletPointItems:
      "== Equal to. === Equal to Value and Type. != Not Equal. !== Not Equal in Value or Type. > Greater. < Smaller.",
  },
  {
    title: "logical-opp",
    text: "There are three logical operators in JavaScript:",
    bulletPointItems: "|| = OR. && = AND. ! = NOT.",
  },
  {
    title: "con-operations",
    text:
      "The condition (before the ?) is evaluated as a boolean. If the condition is true it returns the first expression before the colon. Otherwise it returns the condition after the colon.",
  },
  {
    title: "string-methods",
    bulletPointItems: `concat() Combines strings.
    indexOf()  returns index of character.
    match() - matches based on REGEXP.
    slice() Returns a substring based on the “start” and “end” parameters.  
    split() Splits a string according to the specified delimiter.
    `,
  },
];

listContainer.addEventListener("click", function (e) {
  const display = document.getElementById("display-container");
  const definitionText = definitions
    .map((item) => {
      if (item.title === e.target.id) return item.text;
    })
    .join("");

  const listText = definitions
    .map((item) => {
      if (item.title === e.target.id) return item.bulletPointItems;
    })
    .join("");

  const bulletPointText = displayTextAsList(listText);

  display.innerHTML =
    "<div class='def-text'>" + definitionText + "</div>" + bulletPointText;
});

function displayTextAsList(listText) {
  return listText
    .split(".")
    .slice(0, -1)
    .map((item) => "<li class='list'>" + item + "</li>")
    .join("");
}
