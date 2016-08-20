import {collection} from '../schema';
import {Collection} from "../collection";
import {Cursor} from '../cursor';
import {TestDocument} from "./TestDocument";

@collection('test', TestDocument, {w: 'majority'})
export class TestCollection extends Collection<TestDocument> {
    findInListBetween(start:number, end:number):Promise<Cursor<TestDocument>> {
        return this.find({list: {$lt: start, $gt: end}});
    }
}
