export interface Question {
    id: string;
    text: string;
    marks:string;
    givenAnswer: string;
    tqId: number;
    quesNo:number
    selected?: boolean; // Optional property to track selection state
  }