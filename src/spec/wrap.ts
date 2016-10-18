import * as test from 'tape';

export interface Test {
    catch(a: Promise<any>, msg?: string): void;
}

export default function wrapper (msg: string, fn: (assert: test.Test & Test) => Promise<any>) {
    test(msg, async (t) => {
        const more: test.Test & Test = Object.assign(t, {
            catch(a: Promise<any>, msg) {
                return a.then(x => t.ok(false, msg))
                    .catch(err => t.ok(err, msg));
            }
        });
        
        try {
            await fn(more);
            t.end();
        } catch (err) {
            t.fail(err.message);
            t.comment(err.stack);
            t.end();
            
            process.exit();
        }
    });
}
