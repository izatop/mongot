import {TestMergeCollection} from "./TestMergeCollection";
import {collection, index, indexes} from '../schema';
import {Collection} from "../collection";
import {Cursor} from '../cursor';
import {TestDocument} from "./TestDocument";

@index({number: -1}, {background: false})
@index('randomUniqueKey', {unique: true, background: false})
@indexes(['number', {background: false}], [{name: -1, date: 1}, {sparse: true, background: false}])
@collection('test_collection', TestDocument)
export class TestCollection extends Collection<TestDocument> {
    findNumbersBetweenTwoValues(start: number, end: number): Promise<Cursor<TestDocument>> {
        return this.find({number: {$lt: start, $gt: end}});
    }
}
