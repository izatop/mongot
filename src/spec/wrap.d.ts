/// <reference types="tape" />
import * as test from 'tape';
export interface Test {
    catch(a: Promise<any>, msg?: string): void;
}
export default function wrapper(msg: string, fn: (assert: test.Test & Test) => Promise<any>): void;
