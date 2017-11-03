import {SchemaFragment, SchemaFragmentArray, SchemaDocument, SchemaArray} from '../document';
import {prop, req, hook, fragment, auto, ObjectID, Long, virtual} from '../schema';
import {document} from "../schema";
import {createNextAutoIncrementNumber} from "../collection/helpers";
import {Events} from "../collection";

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
    @prop(ChildFragment) child: SchemaFragmentArray<ChildFragment>;
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

    @prop long: Long = Long.fromNumber(Math.round(Math.random() * 1000));

    @virtual get sum() {
        return this.listOfNumbers.reduce((l, r) => l+r);
    }

    @hook(Events.beforeInsert)
    protected generateRandomKey() {
        this.randomUniqueKey = Math.random() * 90000000;
        this.version = 1;
    }

    @hook(Events.beforeUpdate)
    protected updateVersion() {
        this.version++;
    }
}
