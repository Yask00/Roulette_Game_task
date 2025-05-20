const ChipColors = Object.freeze({
  blue: 1,
  gold: 2,
  red: 3,
});

const BetTypes = Object.freeze({
  number: 1, // 1-36
  column: 2, // column-1, column-2, column-3
  third: 3, // first-third, second-third, third-third
  half: 4, // first-half, second-half
  odd: 5, // odd
  even: 6, // even
  red: 7, // red
  black: 8, // black
});

const actionTypes = Object.freeze({
    undo: "undo",
    clear: "clear",
    double: "double",
});

class Chip {
  constructor(value, color) {
    this.value = value;
    this.color = color;
    this.selected = false;

    this.element = document.createElement("div");
    this.element.className =
      "action-container__chip " + `action-container__chip-${color}`;
    this.element.innerText = value;
    this.element.style.backgroundImage = `url(./assets/images/chip-background-${ChipColors[color]}.png)`;
    this.element.dataset.chipId = value;
    document
      .getElementsByClassName("action-container__chips")[0]
      .appendChild(this.element);
  }

  get selected() {
    return this._selected;
  }

  set selected(value) {
    this._selected = value;
  }
}

class Event {
  constructor() {
    this.handlers = new Map();
    this.count = 0;
  }

  subscribe(handler) {
    this.handlers.set(++this.count, handler);
    this.count;
  }

  unsubscribe(idx) {
    this.handlers.delete(idx);
  }

  fire(sender, args) {
    this.handlers.forEach((handler, k) => {
      handler(sender, args);
    });
  }
}

class GameActions {
  constructor() {
    this.tableBet = new Event();
    this.actionBet = new Event();
    this.chipSelect = new Event();
  }

  fireTableBet(sender, args) {
    this.tableBet.fire(sender, args);
  }

  fireAction(sender, args) {
    // console.log(sender, args);
    this.actionBet.fire(sender, args);
  }

  fireChipSelect(sender, args) {
    this.chipSelect.fire(sender, args);
  }
}

class Game {
  constructor(game, chips) {
    this.game = game;
    this.chips = chips;
    this.bets = {};
    this.selectedChip = null;
    game.tableBet.subscribe(this.handleTableBet.bind(this));
    game.actionBet.subscribe(this.handleAction.bind(this));
    game.chipSelect.subscribe(this.handleChipSelect.bind(this));
  }

  handleTableBet(sender, args) {
    // console.log("Table Bet Fired", sender, args);
    // console.log(this.selectedChip);
    // TODO:
    if (!this.selectedChip) {
      console.error("No chip selected");
      return;
    }

    if (this.bets[args]) {
      this.bets[args].push(this.selectedChip.value);
    } else if (!this.bets[args]) {
      this.bets[args] = [];
      this.bets[args] = [this.selectedChip.value];
    }

    console.log(this.bets);
  }

  handleAction(sender, args) {
    switch (args) {
        case actionTypes.undo:
            // TODO: 
            console.log("Undo Action Fired", sender, args);
            break;
        case actionTypes.clear:
            this.bets = {};
            console.log(this.bets);
            break;
        case actionTypes.double:
            Object.keys(this.bets).forEach((key) => {
                this.bets[key] = this.bets[key].map((bet) => bet * 2);
            });
            break;
        default:
            console.error("Unknown action type");
            break;
    }
    
  }

  handleChipSelect(sender, id) {
    // console.log("Chip Select Fired", sender, id);
    this.selectedChip = this.chips.find((chip) => chip.value == id);
    if (this.selectedChip) {
      this.toggleSelectedChip(this.selectedChip);
    }
  }

  // toggleSelect() {
  //     this.selected = !this.selected;
  //     this.element.classList.add("action-container__chip--selected");
  //     this.toggleOtherChips(this.element);
  // }

  toggleSelectedChip(elem) {
    this.chips.forEach((chip) => {
      if (chip !== elem) {
        chip.selected = false;
        chip.element.classList.remove("action-container__chip--selected");
      } else {
        chip.selected = true;
        chip.element.classList.add("action-container__chip--selected");
      }
    });
  }
}

const chips = [new Chip(1, "blue"), new Chip(2, "gold"), new Chip(5, "red")];
const gameActions = new GameActions();
const game = new Game(gameActions, chips);

const rouletteTable = document.querySelector(".rlt-table");
const chipsContainer = document.querySelector(".action-container__chips");
const actionContainer = document.querySelector(".action-container__actions");

rouletteTable.addEventListener("click", (event) => {
    gameActions.fireTableBet(null, event.target.dataset.bet);
});

chipsContainer.addEventListener("click", (event) => {
  if (event.target.classList.contains("action-container__chip")) {
    gameActions.fireChipSelect(null, event.target.dataset.chipId);
  }
});

actionContainer.addEventListener("click", (event) => {
  if (event.target.classList.contains("action-container__action")) {
    gameActions.fireAction(null, event.target.dataset.action);
  }
});