"use strict";
/**
 * Card, Rank, and Suit classes
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Suit {
    static all() {
        return [
            Suit.CLUB, Suit.DIAMOND, Suit.HEART, Suit.SPADE
        ];
    }
    static fromString(s) {
        switch (s) {
            case 'c':
                return Suit.CLUB;
            case 'd':
                return Suit.DIAMOND;
            case 'h':
                return Suit.HEART;
            case 's':
                return Suit.SPADE;
            default:
                throw new Error(`Invalid card suit: ${s}`);
        }
    }
}
Suit.CLUB = 1;
Suit.DIAMOND = 2;
Suit.HEART = 3;
Suit.SPADE = 4;
exports.Suit = Suit;
class Rank {
    static fromString(s) {
        switch (s) {
            case 't':
                return Rank.TEN;
            case 'j':
                return Rank.JACK;
            case 'q':
                return Rank.QUEEN;
            case 'k':
                return Rank.KING;
            case 'a':
                return Rank.ACE;
            default:
                const n = Number(s);
                if (isNaN(n) || n < Rank.TWO || n > Rank.NINE) {
                    throw new Error(`Invalid card rank: ${s}`);
                }
                return n;
        }
    }
    all() {
        return [
            Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN,
            Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
        ];
    }
}
Rank.TWO = 2;
Rank.THREE = 3;
Rank.FOUR = 4;
Rank.FIVE = 5;
Rank.SIX = 6;
Rank.SEVEN = 7;
Rank.EIGHT = 8;
Rank.NINE = 9;
Rank.TEN = 10;
Rank.JACK = 11;
Rank.QUEEN = 12;
Rank.KING = 13;
Rank.ACE = 14;
Rank.names = [
    null,
    null,
    { singular: 'deuce', plural: 'deuces' },
    { singular: 'three', plural: 'threes' },
    { singular: 'four', plural: 'fours' },
    { singular: 'five', plural: 'fives' },
    { singular: 'six', plural: 'sixes' },
    { singular: 'seven', plural: 'sevens' },
    { singular: 'eight', plural: 'eights' },
    { singular: 'nine', plural: 'nines' },
    { singular: 'ten', plural: 'tens' },
    { singular: 'jack', plural: 'jacks' },
    { singular: 'queen', plural: 'queens' },
    { singular: 'king', plural: 'kings' },
    { singular: 'ace', plural: 'aces' }
];
exports.Rank = Rank;
class Card {
    constructor(rank, suit, blockheight) {
        this.rank = rank;
        this.suit = suit;
        this.blockheight = blockheight;
    }
    static fromString(s) {
        if (s.length !== 34) {
            throw new Error(`Card string must be 34 length, but given: ${s.length}`);
        }
        return new Card(Rank.fromString(s.slice(0, 1).toLowerCase()), Suit.fromString(s.slice(1, 2).toLowerCase()), parseInt(s.slice(2, s.length), 16));
    }
    toId() {
        let asm = this.toString();
        let nstr = asm.slice(0, 1);
        let sstr = asm.slice(1, 2);
        var n = 0;
        var s = 0;
        if (nstr == "K")
            n = 0;
        else if (nstr == "A")
            n = 1;
        else if (nstr == "T")
            n = 10;
        else if (nstr == "J")
            n = 11;
        else if (nstr == "Q")
            n = 12;
        else
            n = parseInt(nstr);
        if (sstr == "s")
            s = 0;
        else if (sstr == "h")
            s = 1;
        else if (sstr == "d")
            s = 2;
        else if (sstr == "c")
            s = 3;
        else
            s = parseInt(sstr);
        return s * 13 + n;
    }
    static generateNewCard(allCards) {
        var newCard = new Card(Card.generateRank(), Math.ceil(Math.random() * 3), Date.now());
        if (allCards.map(c => c.toString()).indexOf(newCard.toString()) !== -1) {
            // if newcard is duplicated
            return Card.generateNewCard(allCards);
        }
        else {
            return newCard;
        }
    }
    static generateRank() {
        let rank = Math.ceil(Math.random() * 13);
        if (rank < 2 || 14 < rank) {
            return Card.generateRank();
        }
        else {
            return rank;
        }
    }
    getRank() {
        return this.rank;
    }
    getSuit() {
        return this.suit;
    }
    equals(c) {
        return (this.getRank() === c.getRank() && this.getSuit() === c.getSuit());
    }
    toString(suit = true, full, plural) {
        if (full) {
            if (plural) {
                return Rank.names[this.rank].plural;
            }
            return Rank.names[this.rank].singular;
        }
        let s = `${this.rank}`;
        if (this.rank === 10) {
            s = 'T';
        }
        else if (this.rank === 11) {
            s = 'J';
        }
        else if (this.rank === 12) {
            s = 'Q';
        }
        else if (this.rank === 13) {
            s = 'K';
        }
        else if (this.rank === 14) {
            s = 'A';
        }
        if (suit) {
            if (this.suit === Suit.CLUB) {
                s = s + 'c';
            }
            else if (this.suit === Suit.DIAMOND) {
                s = s + 'd';
            }
            else if (this.suit === Suit.HEART) {
                s = s + 'h';
            }
            else if (this.suit === Suit.SPADE) {
                s = s + 's';
            }
        }
        return s;
    }
}
exports.Card = Card;
class CardTuple {
    constructor(cardA, cardB) {
        this.cardA = cardA;
        this.cardB = cardB;
    }
}
exports.CardTuple = CardTuple;
class LosersCard {
    constructor(loser, cardTuple) {
        this.loser = loser;
        this.cardTuple = cardTuple;
    }
}
exports.LosersCard = LosersCard;
//# sourceMappingURL=Card.js.map