import {collection, index, indexes} from '../schema';
import {Collection} from "../collection";
import {Cursor} from '../cursor';
import {TestDocument} from "./TestDocument";

@index({number: -1})
@index('randomUniqueKey', {unique: true})
@indexes(['number'], [{name: -1, date: 1}, {sparse: true}])
@collection('foo', TestDocument)
export class TestCollection extends Collection<TestDocument> {
    findNumbersBetweenTwoValues(start: number, end: number): Promise<Cursor<TestDocument>> {
        return this.find({number: {$lt: start, $gt: end}});
    }
}
