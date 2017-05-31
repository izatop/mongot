import {prop} from "../schema";
import {SchemaDocument} from "../document";

export class TestBase extends SchemaDocument {
    @prop foo: string;
    @prop bar: boolean = false;
}
