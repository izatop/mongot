import { SchemaFragment, SchemaFragmentArray, SchemaDocument, SchemaArray } from '../document';
import { ObjectID, Long } from '../schema';
export declare class ChildFragment extends SchemaFragment {
    min: number;
    max: number;
    readonly avg: number;
}
export declare class BarFragment extends SchemaFragment {
    baz: string;
}
export declare class FooFragment extends SchemaFragment {
    bar: BarFragment;
}
export declare class TestDocument extends SchemaDocument {
    autoIncrement: number;
    randomUniqueKey: number;
    name: string;
    number: number;
    listOfNumbers: SchemaArray<number>;
    defaults: ChildFragment;
    optional: ChildFragment;
    children: SchemaFragmentArray<ChildFragment>;
    version: number;
    any: Object;
    deep: FooFragment;
    date: Date;
    someId: ObjectID;
    long: Long;
    readonly sum: number;
    protected generateRandomKey(): void;
    protected updateVersion(): void;
}
