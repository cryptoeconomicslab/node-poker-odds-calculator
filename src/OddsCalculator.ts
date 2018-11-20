/**
 * OddsCalculator
 *
 */
import * as _ from 'lodash';
import { Card, Suit, CardTuple, LosersCard } from './Card';
import { CardGroup } from './CardGroup';
import { FullDeckGame, IGame, ShortDeckGame } from './Game';
import { HandRank } from './HandRank';
import { DuplicationLog, Record } from './DuplicationLog';

export class HandEquity {
  protected possibleHandsCount: number;
  protected bestHandCount: number;
  protected tieHandCount: number;

  public constructor() {
    this.possibleHandsCount = 0;
    this.bestHandCount = 0;
    this.tieHandCount = 0;
  }

  public addPossibility(isBestHand: boolean, isTie: boolean): void {
    this.possibleHandsCount += 1;
    if (isBestHand) {
      this.bestHandCount += 1;
    } else if (isTie) {
      this.tieHandCount += 1;
    }
  }

  public getEquity(): number {
    if (this.possibleHandsCount === 0) {
      return 0;
    }
    return Math.round(this.bestHandCount * 100.0 / this.possibleHandsCount);
  }

  public getTiePercentage(): number {
    if (this.possibleHandsCount === 0) {
      return 0;
    }
    return Math.round(this.tieHandCount * 100.0 / this.possibleHandsCount);
  }

  public toString(): string {
    let s: string = `${this.getEquity()}%`;
    const tie: number = this.getTiePercentage();
    if (tie > 0) {
      s += ` (Tie: ${tie}%)`;
    }
    return s;
  }
}

export class OddsCalculator {
  public static DEFAULT_ITERATIONS: number = 100000;
  public equities: HandEquity[];
  protected odds: number[];
  protected handranks: HandRank[];
  protected iterations: number;
  protected elapsedTime: number;
  protected duplicationLog: DuplicationLog;

  protected constructor(equities: HandEquity[], handranks: HandRank[], iterations: number, elapsedTime: number, duplicationLog: DuplicationLog) {
    this.equities = equities;
    this.handranks = handranks;
    this.iterations = iterations;
    this.elapsedTime = elapsedTime;
    this.duplicationLog = duplicationLog;
  }

  public static calculate(cardgroups: CardGroup[], board?: CardGroup, gameVariant?: string, iterations?: number): OddsCalculator {
    if (board && [0, 3, 4, 5].indexOf(board.length) === -1) {
      throw new Error('The board must contain 0, 3, 4 or 5 cards');
    }

    const allGroups: CardGroup[] = board ? cardgroups.concat(board) : cardgroups;
    let allCards: Card[] = [];
    let duplicationLog: DuplicationLog = new DuplicationLog();
    allGroups.forEach((group: CardGroup) => {
      allCards = allCards.concat(group);
    });
    // Invalid card values
    if (gameVariant === 'short') {
      allCards.forEach((card: Card) => {
        if (card.getRank() < 6) {
          throw new Error('Only cards rank 6 through A are valid.');
        }
      });
    }


    const uniqCardsA: Card[] = _.uniqBy(allCards.slice(0,5), (card: Card) => {
      return card.getRank() + '-' + card.getSuit();
    })
    const uniqCardsB: Card[] = _.uniqBy(allCards.slice(5,10), (card: Card) => {
        return card.getRank() + '-' + card.getSuit();
    })
    const uniqCards: Card[] = _.uniqBy(allCards, (card: Card) => {
      return card.getRank() + '-' + card.getSuit();
    })
    if (uniqCardsA.length !== allCards.slice(0,5).length) {
        throw new Error("Detected duplicate cards in one's hands");
    }
    if (uniqCardsB.length !== allCards.slice(5,10).length) {
        throw new Error("Detected duplicate cards in one's hands");
    }
    if (uniqCards.length !== allCards.length) {
      // Shuffle for duplicated hand
      // blockheight is needed for each card

      let duplicatedCards:CardTuple[] = _.uniq(
        allCards.slice(0,5).map((cardA:Card)=>{
          let cardB = allCards.slice(5,10).filter((cardB:Card)=> cardA.toString() == cardB.toString() )[0]
          return new CardTuple(cardA, cardB)
        })
      )
      .filter(dupTuple=> dupTuple.cardB )

      // losen card shall be omited from evaluation (delete)
      let losersCards:LosersCard[] = duplicatedCards.map((cardTuple:CardTuple)=>{
        if(cardTuple.cardA.getSuit() === Suit.SPADE || cardTuple.cardA.getSuit() == Suit.CLUB){
          // Older card wins
          if(cardTuple.cardA.blockheight < cardTuple.cardB.blockheight){
            // loser
            return new LosersCard(1, cardTuple)
          } else {
            // loser
            return new LosersCard(0, cardTuple)
          }
        } else {
          // Younger card wins
          if(cardTuple.cardA.blockheight > cardTuple.cardB.blockheight){
            // loser
            return new LosersCard(1, cardTuple)
          } else {
            return new LosersCard(0, cardTuple)
          }
        }
      })

      let aliceCards: Card[] = []
      let aliceCardGroup: CardGroup = new CardGroup()
      let bobCards: Card[] = []
      let bobCardGroup: CardGroup = new CardGroup()
      losersCards.map((loseCard: LosersCard)=>{
        var newCard: Card = Card.generateNewCard(allCards)
        aliceCards = allCards.slice(0,5).filter((_card:Card)=> loseCard.cardTuple.cardA.toString() != _card.toString() )
        bobCards = allCards.slice(5,10).filter((_card:Card)=> loseCard.cardTuple.cardB.toString() != _card.toString() )
        if(loseCard.loser === 0){
          aliceCards.push(newCard)
          bobCards.push(loseCard.cardTuple.cardA)
          duplicationLog.addRecord(new Record(0, loseCard.cardTuple.cardA, newCard, aliceCards))
        } else if (loseCard.loser === 1) {
          aliceCards.push(loseCard.cardTuple.cardB)
          bobCards.push(newCard)
          duplicationLog.addRecord(new Record(1, loseCard.cardTuple.cardB, newCard, bobCards))
        } else {
          throw new Error("no owner for duplicated card")
        }
        allCards = aliceCards.concat(bobCards)
      })

      aliceCards.map(o=>{
        aliceCardGroup.push(o)
      })
      bobCards.map(o=>{
        bobCardGroup.push(o)
      })

      cardgroups = [
        aliceCardGroup,
        bobCardGroup
      ]
  }

    iterations = iterations || 0;

    let game: IGame;

    if (gameVariant === 'short') {
      game = new ShortDeckGame();
    } else {
      game = new FullDeckGame();
    }

    let handranks: HandRank[] = [];

    // Find out which cards are left in the deck
    const remainingCards: CardGroup = new CardGroup();
    if (!board || board.length <= 4) {
      for (const suit of Suit.all()) {
        for (const rank of game.rank.all()) {
          const c: Card = new Card(rank, suit, Date.now());
          let isUsed: boolean = false;

          if (board) {
            for (const boardCard of board) {
              if (c.equals(boardCard)) {
                isUsed = true;
                break;
              }
            }
          }

          if (!isUsed) {
            for (const cardgroup of cardgroups) {
              for (const card of cardgroup) {
                if (c.equals(card)) {
                  isUsed = true;
                  break;
                }
              }
              if (isUsed) {
                break;
              }
            }
          }

          if (!isUsed) {
            remainingCards.push(c);
          }
        }
      }
    }

    const remainingCount: number = remainingCards.length;

    // Figure out hand ranking
    handranks = cardgroups.map((cardgroup: CardGroup): HandRank => {
      return HandRank.evaluate(game, board ? cardgroup.concat(board) : cardgroup);
    });

    const equities: HandEquity[] = cardgroups.map((cardgroup: CardGroup): HandEquity => {
      return new HandEquity();
    });

    const selectWinners: Function = (simulatedBoard: CardGroup): void => {
      let highestRanking: HandRank = null;
      let highestRankingIndex: number[] = [];
      for (let i: number = 0; i < cardgroups.length; i += 1) {
        const handranking: HandRank = HandRank.evaluate(
          game,
          cardgroups[i].concat(simulatedBoard)
        );
        const isBetter: number = highestRanking
          ? handranking.compareTo(highestRanking)
          : -1;
        if (highestRanking === null || isBetter >= 0) {
          if (isBetter === 0) {
            highestRankingIndex.push(i);
          } else {
            highestRankingIndex = [i];
          }
          highestRanking = handranking;
        }
      }
      for (let i: number = 0; i < cardgroups.length; i += 1) {
        let isWinning: boolean = false;
        let isTie: boolean = false;

        if (highestRankingIndex.length > 1) {
          isTie = (highestRankingIndex.indexOf(i) > -1);
        } else {
          isWinning = (highestRankingIndex.indexOf(i) > -1);
        }

        equities[i].addPossibility(isWinning, isTie);
      }
    };

    const jobStartedAt: number = +new Date();
    if (!board || board.length === 0) {
      iterations = iterations || OddsCalculator.DEFAULT_ITERATIONS;

      for (let x: number = iterations; x > 0; x -= 1) {
        const index1: number = _.random(0, remainingCount - 1);
        let index2: number;
        let index3: number;
        let index4: number;
        let index5: number;

        do {
          index2 = _.random(0, remainingCount - 1);
        } while (index2 === index1);

        do {
          index3 = _.random(0, remainingCount - 1);
        } while (index3 === index1 || index3 === index2);

        do {
          index4 = _.random(0, remainingCount - 1);
        } while (index4 === index1 || index4 === index2 || index4 === index3);

        do {
          index5 = _.random(0, remainingCount - 1);
        } while (index5 === index1 || index5 === index2 || index5 === index3 || index5 === index4);

        const simulatedBoard: CardGroup = CardGroup.fromCards([
          remainingCards[index1],
          remainingCards[index2],
          remainingCards[index3],
          remainingCards[index4],
          remainingCards[index5]
        ]);

        selectWinners(simulatedBoard);
      }
    } else if (board.length >= 5) {
      iterations = 1;
      selectWinners(board);
    } else if (board.length === 4) {
      for (const c of remainingCards) {
        const simulatedBoard: CardGroup = board.concat(CardGroup.fromCards([c]));
        iterations += 1;
        selectWinners(simulatedBoard);
      }
    } else if (board.length === 3) {
      for (let a: number = 0; a < remainingCount; a += 1) {
        for (let b: number = a + 1; b < remainingCount; b += 1) {
          const simulatedBoard: CardGroup = board.concat(CardGroup.fromCards([remainingCards[a], remainingCards[b]]));
          iterations += 1;
          selectWinners(simulatedBoard);
        }
      }
    }

    const jobEndedAt: number = +new Date();
    return new OddsCalculator(equities, handranks, iterations, jobEndedAt - jobStartedAt, duplicationLog);
  }

  public getIterationCount(): number {
    return this.iterations;
  }

  public getElapsedTime(): number {
    return this.elapsedTime;
  }

  public getHandRank(index: number): HandRank {
    return this.handranks[index];
  }
}
