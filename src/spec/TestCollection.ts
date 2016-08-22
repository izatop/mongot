import {collection} from '../schema';
import {Collection} from "../collection";
import {Cursor} from '../cursor';
import {TestDocument} from "./TestDocument";

@collection('foo', TestDocument)
export class TestCollection extends Collection<TestDocument> {
    findNumbersBetweenTwoValues(start: number, end: number): Promise<Cursor<TestDocument>> {
        return this.find({number: {$lt: start, $gt: end}});
    }
}
