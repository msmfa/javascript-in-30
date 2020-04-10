const listContainer = document.querySelector(".list-container");

const definitions = [
  {
    title: "variables",
    text:
      "Variables are containers which hold reusable data. In Javascript we use let and const to declare variables. ",
  },
  {
    title: "data-types",
    text: "Data Types are...",
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
