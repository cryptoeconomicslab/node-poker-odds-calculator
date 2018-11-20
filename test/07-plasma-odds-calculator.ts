/**
 * Odds Calculator Tests
 * (Focus on Short Deck Specifics)
 */
import { expect } from 'chai';
import { CardGroup, HandEquity, HandRank,
         OddsCalculator, ShortDeckGame, ShortDeckRank, Card } from '../src';

describe('OddsCalculator: Duplication scenario', () => {
  it('no board', () => {
    let blk:number = 3124343
    const blkHex:string = ((blk).toString(16)+"").padStart(32, "0")
    let p1str:string = ['8c','As','Ad','2h','9h'].map(s=> s+blkHex ).join(" ")
    let p2str:string = ['5h','Ad','8s','8h','Kh'].map(s=> s+blkHex ).join(" ")

    const player1Cards: CardGroup = CardGroup.fromString(p1str);
    const player2Cards: CardGroup = CardGroup.fromString(p2str);
    const result: OddsCalculator = OddsCalculator.calculate([player1Cards, player2Cards]);
    let r = result.duplicationLog.records[0]
    if (r.who === 0) {
      expect(player2Cards.map(c=> c.toString() ).indexOf(r.destCard.toString())).eq(-1);
    } else {
      expect(player1Cards.map(c=> c.toString() ).indexOf(r.destCard.toString())).eq(-1);
    }

  });
});
