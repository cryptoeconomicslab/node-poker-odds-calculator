/**
 * Card, Rank, and Suit classes
 */

interface ICardName {
  singular: string;
  plural: string;
}

export class Suit {
  public static CLUB: number = 1;
  public static DIAMOND: number = 2;
  public static HEART: number = 3;
  public static SPADE: number = 4;

  public static all(): number[] {
    return [
      Suit.CLUB, Suit.DIAMOND, Suit.HEART, Suit.SPADE
    ];
  }

  public static fromString(s: string): number {
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

export class Rank {
  public static TWO: number = 2;
  public static THREE: number = 3;
  public static FOUR: number = 4;
  public static FIVE: number = 5;
  public static SIX: number = 6;
  public static SEVEN: number = 7;
  public static EIGHT: number = 8;
  public static NINE: number = 9;
  public static TEN: number = 10;
  public static JACK: number = 11;
  public static QUEEN: number = 12;
  public static KING: number = 13;
  public static ACE: number = 14;

  public static names: ICardName[] = [
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

  public static fromString(s: string): number {
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
        const n: number = Number(s);
        if (isNaN(n) || n < Rank.TWO || n > Rank.NINE) {
          throw new Error(`Invalid card rank: ${s}`);
        }
        return n;
    }
  }

  public all(): number[] {
    return [
      Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN,
      Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
    ];
  }
}

export class Card {
  protected rank: number;
  protected suit: number;
  public blockheight: number;

  public constructor(rank: number, suit: number, blockheight: number) {
    this.rank = rank;
    this.suit = suit;
    this.blockheight = blockheight;
  }

  public static fromString(s: string): Card {
    if (s.length !== 34) {
      throw new Error(`Card string must be 34 length, but given: ${s.length}`);
    }
    return new Card(
      Rank.fromString(s.slice(0,1).toLowerCase()),
      Suit.fromString(s.slice(1,2).toLowerCase()),
      parseInt(s.slice(2,s.length), 16)
    );
  }
  public toId(){
    let asm = this.toString()
    let nstr:string = asm.slice(0,1)
    let sstr:string = asm.slice(1,2)
    var n:number = 0;
    var s:number = 0;
    if(nstr == "K") n = 0
    else if (nstr == "A") n = 1
    else if (nstr == "T") n = 10
    else if (nstr == "J") n = 11
    else if (nstr == "Q") n = 12
    else n = parseInt(nstr)
    if (sstr == "s") s = 0
    else if (sstr == "h") s = 1
    else if (sstr == "d") s = 2
    else if (sstr == "c") s = 3
    else s = parseInt(sstr)
    return s*13+n
  }

  public static generateNewCard(allCards:Card[]):Card {
    var newCard: Card = new Card(Math.ceil(Math.random()*13),Math.ceil(Math.random()*3),Date.now())
    if(allCards.map(c=> c.toString() ).indexOf(newCard.toString()) !== -1){
      // if newcard is duplicated
      return Card.generateNewCard(allCards)
    } else {
      return newCard
    }
  }

  public getRank(): number {
    return this.rank;
  }

  public getSuit(): number {
    return this.suit;
  }

  public equals(c: Card): boolean {
    return (this.getRank() === c.getRank() && this.getSuit() === c.getSuit());
  }

  public toString(suit: boolean = true, full?: boolean, plural?: boolean): string {
    if (full) {
      if (plural) {
        return Rank.names[this.rank].plural;
      }
      return Rank.names[this.rank].singular;
    }

    let s: string = `${this.rank}`;
    if (this.rank === 10) {
      s = 'T';
    } else if (this.rank === 11) {
      s = 'J';
    } else if (this.rank === 12) {
      s = 'Q';
    } else if (this.rank === 13) {
      s = 'K';
    } else if (this.rank === 14) {
      s = 'A';
    }

    if (suit) {
      if (this.suit === Suit.CLUB) {
        s = s + 'c';
      } else if (this.suit === Suit.DIAMOND) {
        s = s + 'd';
      } else if (this.suit === Suit.HEART) {
        s = s + 'h';
      } else if (this.suit === Suit.SPADE) {
        s = s + 's';
      }
    }
    return s;
  }
}

export class CardTuple {
  cardA: Card;
  cardB: Card;
  constructor(cardA:Card, cardB:Card){
    this.cardA = cardA;
    this.cardB = cardB;
  }
}

export class LosersCard {
  loser: number;
  cardTuple: CardTuple;
  constructor(loser:number, cardTuple:CardTuple){
    this.loser = loser;
    this.cardTuple = cardTuple;
  }
}
