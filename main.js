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
