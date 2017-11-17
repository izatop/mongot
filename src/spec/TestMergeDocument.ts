import {SchemaFragment, SchemaFragmentArray, SchemaDocument, SchemaArray} from '../document';
import {prop, req, hook, fragment, auto, ObjectID, Long, virtual} from '../schema';
import {document} from "../schema";
import {createNextAutoIncrementNumber} from "../collection/helpers";
import {Events} from "../collection";

@fragment
export class FragmentFragment extends SchemaFragment {
    @prop name: string;
    @prop value: number;
}

@document
export class TestMergeDocument extends SchemaDocument {
    @prop(FragmentFragment) fragments: SchemaFragmentArray<FragmentFragment>;
}
