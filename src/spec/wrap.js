"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const test = require("tape");
function wrapper(msg, fn) {
    test(msg, (t) => __awaiter(this, void 0, void 0, function* () {
        const more = Object.assign(t, {
            catch(a, msg) {
                return a.then(x => t.ok(false, msg))
                    .catch(err => t.ok(err, msg));
            }
        });
        try {
            yield fn(more);
            t.end();
        }
        catch (err) {
            t.fail(err.message);
            t.comment(err.stack);
            t.end();
            process.exit();
        }
    }));
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = wrapper;
//# sourceMappingURL=wrap.js.map