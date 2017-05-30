import {SchemaFragment, SchemaFragmentArray, SchemaDocument, SchemaArray} from '../document';
import {prop, req, hook, fragment, auto, ObjectID} from '../schema';
import {document} from "../schema";
import {createNextAutoIncrementNumber} from "../collection/helpers";

@fragment
export class ChildFragment extends SchemaFragment {
    @prop min: number;
    @prop max: number;

    get avg() {
        return (this.max - this.min) / 2;
    }
}

@fragment
export class BarFragment extends SchemaFragment {
    @prop baz: string;
}

@fragment
export class FooFragment extends SchemaFragment {
    @prop bar: BarFragment = new BarFragment({baz: 'hello'});
}

@document
export class TestDocument extends SchemaDocument {
    @auto(createNextAutoIncrementNumber)
    @prop
    autoIncrement: number;

    @prop randomUniqueKey: number;
    @prop @req name: string;

    @prop number: number = Math.random();
    @prop(Number) listOfNumbers: SchemaArray<number> = new SchemaArray<number>([1, 2, 3]);

    @prop defaults: ChildFragment = new ChildFragment({min: 1,  max: 10});
    @prop optional: ChildFragment;

    @prop(ChildFragment) children: SchemaFragmentArray<ChildFragment>;

    @prop version: number = 0;

    @prop any: Object = {};

    @prop deep: FooFragment = new FooFragment();

    @prop date: Date = new Date;

    @prop someId: ObjectID;

    get sum() {
        return this.listOfNumbers.reduce((l, r) => l+r);
    }

    @hook
    protected beforeInsert() {
        this.randomUniqueKey = Math.random() * 90000000;
        this.version++;
    }
}
