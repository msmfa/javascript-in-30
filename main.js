import { definitions } from "./data.js";
import { numOver30 } from "./getStringLength.js";

console.log(numOver30);

const listContainer = document.querySelector(".list-container");

listContainer.addEventListener("click", function (e) {
  const display = document.getElementById("display-container");

  const mainText = definitions
    .map((item) => {
      if (item.title === e.target.id) return item.text;
    })
    .join("");

  const exampleImage = definitions
    .map((item) => {
      if (item.title === e.target.id)
        return '<img class ="images"src="' + item.image + '">';
    })
    .join("");

  const listText = definitions
    .map((item) => {
      if (item.title === e.target.id) return item.bulletPointItems;
    })
    .join("");

  const bulletPointText = displayTextAsList(listText);

  displayContent(display, mainText, bulletPointText, exampleImage);
});

function displayContent(display, mainText, bulletPointText, exampleImage) {
  display.innerHTML = `<div class='def-text'>${mainText}</div>${bulletPointText}${exampleImage}`;
}

function displayTextAsList(listText) {
  return listText
    .split(".")
    .slice(0, -1)
    .map((item) => `<li class='list'>${item}</li>`)
    .join("");
}
