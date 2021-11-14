import { IDishDbo } from "@models/dbos/dish-dbo.interface";
import { ITag } from "./tag.interface";

export interface IDish extends Omit<IDishDbo, 'tags'> {
  tags: ITag[];
}
