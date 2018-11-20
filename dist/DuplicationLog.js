"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Record {
    constructor(who, srcCard, destCard, newHands) {
        this.who = who;
        this.srcCard = srcCard;
        this.destCard = destCard;
        this.newHands = newHands;
    }
}
exports.Record = Record;
class DuplicationLog {
    constructor() {
        this.records = [];
    }
    addRecord(record) {
        this.records.push(record);
    }
}
exports.DuplicationLog = DuplicationLog;
//# sourceMappingURL=DuplicationLog.js.map