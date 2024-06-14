/**
 * Class for the custom gamemode
 * !! This class alow to create only one custom gamemode !!
 */
export default class gamemode {
  constructor(element) {
    this.element = element;

    // wrapper div for gamemode
    const wrapperClassName = "parties-game-type-card-category-div ember-view";
    this.wrapper = document.createElement("div");
    this.wrapper.className = wrapperClassName;
    // we put an id to the custom gamemode so we can select/deselect it when we want
    this.wrapper.id = "custom_gamemode";
    this.element.appendChild(this.wrapper);

    // Radio button to select gamemode
    const radioClassName = "parties-game-type-card-category-radio-option";
    this.radio = document.createElement("div");
    this.radio.className = radioClassName;
    this.wrapper.appendChild(this.radio);

    // event listener for click on the gamemode
    const allChoices = document.querySelectorAll(
      ".parties-game-type-card-category-div"
    );

    allChoices.forEach((choice) => {
      choice.addEventListener("click", () => {
        if (choice.id === "custom_gamemode") {
          choice.classList.add("selected");

          // Deselect the other gamemodes
          allChoices.forEach((otherChoice) => {
            if (otherChoice.id !== "custom_gamemode") {
              otherChoice.classList.remove("selected");
            }
          });
        } else {
          // Deselect the custom gamemode if another gamemode is selected
          this.wrapper.classList.remove("selected");
        }
      });
    });
  }

  // Set the text of the gamemode
  setText(text) {
    const textClassName = "parties-game-type-card-category-btn";
    const textDiv = document.createElement("div");
    textDiv.className = textClassName;
    textDiv.innerHTML = text;
    this.wrapper.appendChild(textDiv);

    this.text = textDiv;
  }

  // Set the subtitle of the gamemode
  setSubtitle(subtitle) {
    const subtitleClassName = "allowable-premade-sizes-text";
    const span = document.createElement("span");
    span.className = subtitleClassName;
    span.innerHTML = subtitle;
    this.text.appendChild(span);
  }

  // Set the gamemode as selected
  select() {
    this.wrapper.classList.add("selected");
  }
}
