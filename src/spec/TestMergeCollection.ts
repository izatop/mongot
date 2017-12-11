import {Collection} from "../collection";
import {collection} from "../schema";
import {TestMergeDocument} from "./TestMergeDocument";

export const TEST_MERGE_COLLECTION = 'test_merge_collection';

@collection(TEST_MERGE_COLLECTION, TestMergeDocument)
export class TestMergeCollection extends Collection<TestMergeDocument> {}