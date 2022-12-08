import { definitions } from "./data.js";

// the left hand side panel that contains the list of
// links to be clicked
const sectionLeft = document.querySelector(".section-left");

sectionLeft.addEventListener("click", function (e) {
  const sectionRight = document.querySelector(".section-right");

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
  displayContent(sectionRight, mainText, bulletPointText, exampleImage);
});

function displayContent(display, mainText, bulletPointText, exampleImage) {
  display.innerHTML = `<div class='def-text'>${mainText}</div><div class="bullet-text">${bulletPointText}</div>${exampleImage}`;
}

function displayTextAsList(listText) {
  return listText
    .split(".")
    .slice(0, -1)
    .map((item) => `<li class='list'>${item}</li>`)
    .join("");
}
