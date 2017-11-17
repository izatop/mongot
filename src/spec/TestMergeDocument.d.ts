import { SchemaFragment, SchemaFragmentArray, SchemaDocument } from '../document';
export declare class FragmentFragment extends SchemaFragment {
    name: string;
    value: number;
}
export declare class TestMergeDocument extends SchemaDocument {
    fragments: SchemaFragmentArray<FragmentFragment>;
}
