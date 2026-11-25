export const SCORE_KEYS={distance:'wakalito-best',total:'wakalito-best-score'};
export function totalScore(distance,coins,coinPoints=coins*10){return Math.floor(distance)+coinPoints}
export class ScoreRecords {
 constructor(storage){try{this.storage=storage??globalThis.localStorage;this.distance=Math.max(0,Number(this.storage?.getItem(SCORE_KEYS.distance))||0);this.total=Math.max(this.distance,Number(this.storage?.getItem(SCORE_KEYS.total))||0)}catch{this.storage=null;this.distance=0;this.total=0}}
 save(distance,coins,coinPoints){this.distance=Math.max(this.distance,Math.floor(distance));this.total=Math.max(this.total,totalScore(distance,coins,coinPoints));try{this.storage?.setItem(SCORE_KEYS.distance,String(this.distance));this.storage?.setItem(SCORE_KEYS.total,String(this.total))}catch{}}
}
