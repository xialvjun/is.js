"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var js_utils_1 = require("@xialvjun/js-utils");
// 下面用 pipe
exports.pipe = function (validates) { return function (input) {
    var output = input, validation = { input: input, output: output, is_valid: true, error: null };
    for (var _i = 0, validates_1 = validates; _i < validates_1.length; _i++) {
        var validate = validates_1[_i];
        validation = validate(output);
        if (!validation.is_valid) {
            break;
        }
        output = validation.output;
    }
    return __assign({}, validation, { input: input });
}; };
// : { [K in string]: Validate | Validate[] }
var object = function (schema, message) { return function (input) {
    if (typeof input !== "object") {
        return { input: input, output: null, is_valid: false, error: message };
    }
    var output = null, is_valid = true, error = null;
    for (var key in schema) {
        var validation = exports.pipe([].concat(schema[key]))(js_utils_1.get_path(input, key));
        output = js_utils_1.set_path(output, key, validation.output);
        is_valid = is_valid && validation.is_valid;
        error = js_utils_1.set_path(error, key, validation.error);
    }
    return { input: input, output: output, is_valid: is_valid, error: error };
}; };
var float = function (error, is_string_ok) { return function (input) {
    if (typeof input === 'number' && !Number.isNaN(input)) {
        return { input: input, output: input, is_valid: true, error: null };
    }
    if (is_string_ok && typeof input === 'string') {
        var output = parseFloat(input);
        if (!Number.isNaN(output)) {
            return { input: input, output: output, is_valid: true, error: null };
        }
    }
    return { input: input, output: 0, is_valid: false, error: error };
}; };
// var t;
// t.object({
//   name: [t.string('must be a string'), t.required('required'), ],
//   // 如果 t.array 用成 [t.array(), t.enum(['A', 'B', 'C', 'D'], 'must be ABCD')] ... 即 靠 next 的形式，让后面所有的函数都修饰 array_item ... 那么，t.unique 就不知道应该放在哪里了
//   roles: [t.array([t.enum(['A', 'B', 'C', 'D'], 'must be ABCD')], 'must be an array'), t.unique('roles must not duplicate'), ],
//   // 同样，t.object 还可与 custom validate 匹配
//   a_is_bigger_than_b: [t.object({ a: t.number(), b: t.number() }), input => {
//     const is_valid = input.a > input.a;
//     const output = is_valid ? input : { a: input.a, b: input.a - 1 };
//     const error = is_valid ? null : 'a_is_bigger_than_b';
//     return { input, output, is_valid, error };
//   }]
// })
var check_money = object({
    money: float('should be a number', true)
}, 'should be an object');
// console.log(check_money);
console.log(check_money({ money: 0.34 }));
console.log(check_money({ money: "asasf" }));
console.log(check_money({ money: '0.34' }));
// var t;
// t.object({
//   name: [t.optional(''), t.string('必须是字符串')],
//   ids: [t.optional, t.array([t.string, t.not_empty])],
//   money: []
// })
// t.object = (schema, error, value, next) => {
// }
// const is_empty_array = (error, value, next) => {
//   if (Object.prototype.toString.call(value) === '[object Array]' && value.length === 0) {
//     return next(value);
//   }
//   return
// }
// var v;
// v.input;
// v.output;
// v.is_valid;
// v.error.toString();
// v.error.name;
// v.error.ids[12];
// const optional = (def, value, next) => {
//   const empty = [undefined, null, '', 0];
//   if (empty.indexOf(value) > -1 || (Object.prototype.toString.call(value) === '[object Array]' && value.length === 0)) {
//   }
// }
