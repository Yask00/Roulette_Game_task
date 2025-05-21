const ChipColors = Object.freeze({
  blue: 1,
  gold: 2,
  red: 3,
});

const BetTypes = Object.freeze({
  number: 1, // 1-36
  column: 2, // 37-39
  third: 3, // 40-42
  half: 4, // 43 and 48
  even: 5, // 44
  red: 6, // 45
  black: 7, // 46
  odd: 8, // 47
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
    this.betId = 1;
    this.lastBetIds = [];
    this.selectedChip = null;
    game.tableBet.subscribe(this.handleTableBet.bind(this));
    game.actionBet.subscribe(this.handleAction.bind(this));
    game.chipSelect.subscribe(this.handleChipSelect.bind(this));
  }

  handleTableBet(sender, args) { // args is data-bet=id
    console.log("Table Bet Fired", sender, args);
    // console.log(this.selectedChip);
    if (!this.selectedChip) {
      console.error("No chip selected");
      return;
    }

    if (this.bets[args]) {
      this.bets[args].list.push({id: this.betId, value: this.selectedChip.value});
      this.bets[args].total += this.selectedChip.value;
    } else if (!this.bets[args]) {
      this.bets[args] = {};
      this.bets[args].list = [{id: this.betId, value: this.selectedChip.value}];
      this.bets[args].total = this.selectedChip.value;
    }
    this.lastBetIds.push(this.betId);
    ++this.betId

    // console.log(this.betId);
    // console.log(this.bets);

    this.handleChipOverlay(args)
  }

  handleAction(sender, args) {
    switch (args) {
        case actionTypes.undo:
            console.log(this.lastBetIds);
            if(!this.lastBetIds.length) {
                console.error("No bets to undo");
                return;
            }
            Object.keys(this.bets).forEach((key) => {
              this.bets[key].list = this.bets[key].list.filter((item) => {
                return item.id !== this.lastBetIds[this.lastBetIds.length - 1];
              });
              this.bets[key].total = this.bets[key].list.reduce((acc, item) => {
                return acc + item.value;
              }, 0);

              console.log(key);
              this.handleChipOverlay(key);
            });

            this.lastBetIds.pop();
            console.log("Undo Action Fired", sender, args);
            console.log(this.bets);
            break;
        case actionTypes.clear:
            for (let key in this.bets) {
                this.bets[key].list = [];
                this.bets[key].total = 0;
                this.handleChipOverlay(key);
            }
            console.log(this.bets);
            break;
        case actionTypes.double:
            if(!Object.keys(this.bets).length) {
                console.error("No bets to double");
                return;
            }
            Object.keys(this.bets).forEach((key) => {
                this.bets[key].list = this.bets[key].list.map((item) => {
                    return {id: item.id, value: item.value * 2};
                });
                this.bets[key].total = this.bets[key].total * 2;
                this.handleChipOverlay(key);
            });
            console.log(this.bets);
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

  handleChipOverlay(betCellId) {
    if (!betCellId) {
      console.error("No bet cell id");
      return;
    }

    const betCell = document.querySelector(`[data-bet="${betCellId}"]`);
    const chipInCell = betCell.querySelector(".chip-overlay");

    // console.log(this.bets[betCellId].total);
    
    if (!this.bets[betCellId] || this.bets[betCellId].total === 0) {
      chipInCell.classList = "chip-overlay";
      chipInCell.innerHTML = "";
      return;
    }

    chipInCell.classList = "chip-overlay";
    chipInCell.innerHTML = this.bets[betCellId].total;
    if (this.bets[betCellId].total === 1) {
      chipInCell.classList.add("chip-overlay--active-1");
    } else if (this.bets[betCellId].total === 2) {
      chipInCell.classList.add("chip-overlay--active-2");
    } else if (this.bets[betCellId].total === 5) {
      chipInCell.classList.add("chip-overlay--active-5");
    } else if (this.bets[betCellId].total === 3 || this.bets[betCellId].total === 4 || this.bets[betCellId].total > 5) {
      chipInCell.classList.add("chip-overlay--active");
    }
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


