import * as test from 'tape';

export default function wrapper (msg: string, fn: (assert: test.Test) => Promise<any>) {
    test(msg, async (t) => {
        try {
            await fn(t);
            t.end();
        } catch (err) {
            t.fail(err.message);
            t.comment(err.stack);
            t.end();
        }
    });
}
