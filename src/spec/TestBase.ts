import {prop, document} from "../schema";
import {SchemaDocument} from "../document";

@document
export class TestBase extends SchemaDocument {
    @prop foo: string;
    @prop bar: boolean = false;
}
