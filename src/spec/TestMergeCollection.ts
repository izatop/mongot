import {Collection} from "../collection";
import {collection} from "../schema";
import {TestMergeDocument} from "./TestMergeDocument";

@collection('test_merge_collection', TestMergeDocument)
export class TestMergeCollection extends Collection<TestMergeDocument> {}