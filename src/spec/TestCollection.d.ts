import { Collection } from "../collection";
import { Cursor } from '../cursor';
import { TestDocument } from "./TestDocument";
export declare class TestCollection extends Collection<TestDocument> {
    findNumbersBetweenTwoValues(start: number, end: number): Promise<Cursor<TestDocument>>;
}
