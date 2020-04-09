const listContainer = document.querySelector(".list-container");

const display = document.getElementById("display-container");

const definitions = [
  {
    title: "closure",
    text: "Closure is",
  },
  {
    title: "opps",
    text: "Operations are...",
  },
];

listContainer.addEventListener("click", function (e) {
  display.textContent = definitions
    .map((item) => {
      if (item.title === e.target.id) return item.text;
    })
    .join("");
});
