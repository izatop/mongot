import {TestBase} from "./TestBase";
import {prop} from "../schema";

export class TestExtend extends TestBase {
    @prop baz: number;
}