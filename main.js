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
