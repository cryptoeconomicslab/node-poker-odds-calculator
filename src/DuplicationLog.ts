import { Card } from './Card'

export class Record {
  who:number;
  srcCard:Card;
  destCard:Card;
  newHands:Card[];
  constructor(who:number, srcCard:Card, destCard:Card, newHands:Card[]){
    this.who = who;
    this.srcCard = srcCard;
    this.destCard = destCard;
    this.newHands = newHands;
  }
}

export class DuplicationLog {
  public records: Record[];

  constructor(){
    this.records = []
  }

  addRecord(record:Record){
    this.records.push(record)
  }
}
