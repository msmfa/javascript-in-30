const listContainer = document.querySelector(".list-container");

const definitions = [
  {
    title: "variables",
    text:
      "Variables are containers that hold reusable data. The accepted convention is to use const as much as possible, and let when the variable is likely to be re-assigned",
  },
  {
    title: "data-types",
    text:
      "There are six basic data types in JavaScript. String, Number, Boolean, Array, Object, Function. The first three are primitive data types meaning they store only one value",
  },
  {
    title: "scope",
    text:
      "Scope refers to the current context of code, which determines the accessibility of variables to JavaScript. The two types of scope are local and global",
    imgFile: "",
  },
  {
    title: "functions",
    text: `A function is a set of instructions for Javascript to implement. It consists of the function keyword, followed by: 
      - The name of the function
      - A list of parameters to the function
      - The statements that define the function,`,
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
    text: `A simple and concise syntax for creating functions.
    If we have only one argument, then parentheses around parameters can be omitted.
    Arrow functions do not have a "this" context. 
    `,
  },
  {
    title: "functional-expressions",
    text: `Function expressions load only when the interpreter reaches that line of code. 
    They're not hoisted, allowing them to retain a copy of the local variables from 
    the scope where they were defined.
    `,
  },
];

listContainer.addEventListener("click", function (e) {
  const display = document.getElementById("display-container");
  const userChoice = definitions
    .map((item) => {
      if (item.title === e.target.id) return item.text;
    })
    .join("");
  //Avoids returning a string concated with a comma
  display.textContent = userChoice;
});
