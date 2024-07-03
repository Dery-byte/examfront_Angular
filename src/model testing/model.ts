export interface Question {
    id: string;
    text: string;
    marks:string;
    givenAnswer: [];
    selected?: boolean; // Optional property to track selection state
  }