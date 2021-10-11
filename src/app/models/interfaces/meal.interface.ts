export interface IMeal {
  name: string;
  description: string;
  ingredients: string[];
}
export interface IMealDbo extends IMeal {
  uid: string;
}
