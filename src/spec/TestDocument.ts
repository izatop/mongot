import {SchemaFragment, SchemaFragmentArray, SchemaDocument, SchemaArray} from '../document';
import {prop, req, hook} from '../schema';

export class ChildFragment extends SchemaFragment {
    @prop min: number;
    @prop max: number;
    
    get avg() {
        return (this.max - this.min) / 2;
    }
}

export class BarFragment extends SchemaFragment {
    @prop baz: string;
}

export class FooFragment extends SchemaFragment {
    @prop bar: BarFragment = new BarFragment({baz: 'hello'});
}

export class TestDocument extends SchemaDocument {
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
    
    get sum() {
        return this.listOfNumbers.reduce((l, r) => l+r);
    }
    
    @hook
    protected beforeInsert() {
        this.version++;
    }
}
