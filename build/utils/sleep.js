"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = sleep;
function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}