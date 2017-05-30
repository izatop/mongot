import {TestBase} from "./TestBase";
import {prop, document} from "../schema";

@document
export class TestExtend extends TestBase {
    @prop baz: number;
}
