const listContainer = document.querySelector(".list-container");

const definitions = [
  {
    title: "variables",
    text: "Variables are",
  },
  {
    title: "opps",
    text: "Operations are...",
  },
];

listContainer.addEventListener("click", function (e) {
  const display = document.getElementById("display-container");
  display.textContent = definitions

    .map((item) => {
      if (item.title === e.target.id) return item.text;
    })
    .join("");
  //Avoids returning a string concated with a comma
});
