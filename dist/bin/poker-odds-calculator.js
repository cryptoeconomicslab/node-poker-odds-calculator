#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const program = require("commander");
const index_1 = require("../index");
program
    .option('-b, --board <cards>', 'sets the board')
    .option('-g --game <game variant name>', 'sets the game variant for calculation. options: full, short.', 'full')
    .parse(process.argv);
try {
    const gameVariant = program.game;
    if (gameVariant !== 'short' && gameVariant !== 'full') {
        program.outputHelp();
        throw Error(`invalid game variant: ${gameVariant}`);
    }
    const board = (program.board ? index_1.CardGroup.fromString(program.board) : null);
    const cardgroups = [];
    for (const hand of program.args) {
        cardgroups.push(index_1.CardGroup.fromString(hand));
    }
    if (cardgroups.length <= 1) {
        throw new Error('You must enter at least 2 hands');
    }
    const result = index_1.OddsCalculator.calculate(cardgroups, board, gameVariant);
    const prepend = (board !== null ? '' : '~');
    if (board) {
        console.log('Board: ' + chalk.yellow(board.toString()));
        console.log('');
    }
    let mostEquityIndex = [];
    let mostEquity = 0;
    for (let i = 0; i < cardgroups.length; i += 1) {
        const curEquity = result.equities[i].getEquity() + result.equities[i].getTiePercentage();
        if (curEquity >= mostEquity) {
            if (curEquity > mostEquity) {
                mostEquityIndex = [i];
            }
            else {
                mostEquityIndex.push(i);
            }
            mostEquity = curEquity;
        }
    }
    for (let i = 0; i < cardgroups.length; i += 1) {
        const s = `Player #${i + 1} - ${cardgroups[i]} - ${prepend}${result.equities[i]}`;
        const func = (mostEquityIndex.indexOf(i) >= 0 ? chalk.green : chalk.red);
        console.log(func(s));
    }
    if (board === null || board.length <= 3) {
        console.log('');
        console.log(`Simulated ${result.getIterationCount()} random boards in ${(result.getElapsedTime() / 1000).toFixed(1)} seconds`);
    }
}
catch (err) {
    console.log(chalk.red(err.message));
}
//# sourceMappingURL=poker-odds-calculator.js.map