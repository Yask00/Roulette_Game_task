let ChipColors = Object.freeze({
  blue: 1,
  gold: 2,
  red: 3,
});

export class Chip {
  constructor(value, color) {
    this.value = value;
    this.color = color;
    this.selected = false;

    this.element = document.createElement("div");
    this.element.className = "action-container__chip " + `action-container__chip-${color}`;
    this.element.innerText = value;
    this.element.style.backgroundImage = `url(./assets/images/chip-background-${ChipColors[color]}.png)`;
    this.element.addEventListener("click", () => this.toggleSelect());
    document.getElementsByClassName("action-container__chips")[0].appendChild(this.element);
  }

  get selected() {
    return this._selected;
  }

  set selected(value) {
    this._selected = value;
  }
  
  toggleSelect() {
    this.selected = !this.selected;
    this.element.classList.add("action-container__chip--selected");
    this.toggleOtherChips(this.element);
  }

  toggleOtherChips(elem) {
    const chips = document.querySelectorAll(".action-container__chip");
    chips.forEach((chip) => {
      if (chip !== elem) {
        chip.selected = false;
        chip.classList.remove("action-container__chip--selected");
      }
    });
  }
}
