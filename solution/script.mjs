import { Chip } from './Chip.mjs';

const chips = [
    new Chip(1, 'blue'),
    new Chip(2, 'gold'),
    new Chip(5, 'red')
];

chips.forEach(chip => {
    chip.element.addEventListener('click', () => {
        chip.toggleSelect();
    });
});

// chips in game should have method any selected or selected and events listeners should happen in game class
//  Game(chips) // events from cells on clicks / events from actions / bets history per cell
// events should be Observer pattern

// 1. build table
// 2. Add event that fires custom event
// 3. add observer and subscriber pattern
// 4. finish table logic