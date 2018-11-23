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
exports.pipe = function (validates) { return function (input) {
    validates = js_utils_1.deep_flatten(validates);
    var output = input, validation = { input: input, output: output, error: null, is_valid: true };
    for (var _i = 0, _a = validates; _i < _a.length; _i++) {
        var validate = _a[_i];
        validation = validate(output);
        if (!validation.is_valid) {
            break;
        }
        output = validation.output;
    }
    return __assign({}, validation, { input: input });
}; };
exports.is = {
    // optional 可以设置默认值
    optional: function (validates, default_value, default_generator) { return function (input) {
        if ([undefined, null, "", 0].indexOf(input) > -1 ||
            (js_utils_1.to_string(input) === "[object Array]" && input.length === 0)) {
            var output = default_generator
                ? default_generator()
                : typeof default_value !== "undefined"
                    ? default_value
                    : input;
            return { input: input, output: output, error: null, is_valid: true };
        }
        var validate = exports.pipe(validates);
        return validate(input);
    }; },
    object: function (schema, message) {
        if (message === void 0) { message = "it must be an object"; }
        return function (input) {
            var output = {};
            if (js_utils_1.to_string(input) !== "[object Object]") {
                return { input: input, output: output, error: message, is_valid: false };
            }
            var error = null, is_valid = true;
            for (var name_1 in schema) {
                var validation = exports.pipe(schema[name_1])(js_utils_1.get_path(input, name_1));
                output = js_utils_1.set_path(output, name_1, validation.output);
                error = js_utils_1.set_path(error, name_1, validation.error);
                is_valid = is_valid && validation.is_valid;
            }
            return { input: input, output: output, error: error, is_valid: is_valid };
        };
    },
    array: function (validates, message) {
        if (message === void 0) { message = "it must be an array"; }
        return function (input) {
            var output = [];
            if (js_utils_1.to_string(input) !== "[object Array]") {
                return { input: input, output: output, error: message, is_valid: false };
            }
            var error = null, is_valid = true;
            var validate = exports.pipe(validates);
            input.forEach(function (it, idx) {
                var validation = validate(it);
                output = js_utils_1.set_path(output, idx + "", validation.output);
                error = js_utils_1.set_path(error, idx + "", validation.error);
                is_valid = is_valid && validation.is_valid;
            });
            return { input: input, output: output, error: error, is_valid: is_valid };
        };
    },
    float: function (is_string_ok, error) { return function (input) {
        if (typeof input === "number" && !Number.isNaN(input)) {
            return { input: input, output: input, error: null, is_valid: true };
        }
        if (is_string_ok && typeof input === "string") {
            var output = parseFloat(input);
            if (!Number.isNaN(output)) {
                return { input: input, output: output, error: null, is_valid: true };
            }
        }
        return { input: input, output: 0, error: error, is_valid: false };
    }; },
    integer: function (is_string_ok, error) {
        return exports.pipe([
            exports.is.float(is_string_ok, error),
            function (input) {
                if (Number.isInteger(input)) {
                    return { input: input, output: input, error: null, is_valid: true };
                }
                return { input: input, output: 0, error: error, is_valid: false };
            }
        ]);
    },
    string: function (error) { return function (input) {
        return js_utils_1.to_string(input) === "[object String]"
            ? { input: input, output: input, error: null, is_valid: true }
            : { input: input, output: "", error: error, is_valid: false };
    }; },
    length_gt: function (min, error) { return function (input) {
        return input.length > min
            ? { input: input, output: input, error: null, is_valid: true }
            : { input: input, output: "", error: error, is_valid: false };
    }; },
    length_lt: function (max, error) { return function (input) {
        return input.length > max
            ? { input: input, output: input, error: null, is_valid: true }
            : { input: input, output: "", error: error, is_valid: false };
    }; },
    length_e: function (len, error) { return function (input) {
        return input.length === len
            ? { input: input, output: input, error: null, is_valid: true }
            : { input: input, output: "", error: error, is_valid: false };
    }; },
    match_regex: function (regex, error) { return function (input) {
        if (input.match(regex)) {
            return { input: input, output: input, error: null, is_valid: true };
        }
        return { input: input, output: "", error: error, is_valid: false };
    }; },
    gt: function (min, error) { return function (input) {
        return input > min
            ? { input: input, output: input, error: null, is_valid: true }
            : { input: input, output: "", error: error, is_valid: false };
    }; },
    lt: function (max, error) { return function (input) {
        return input > max
            ? { input: input, output: input, error: null, is_valid: true }
            : { input: input, output: "", error: error, is_valid: false };
    }; },
    equal: function (equal_to, error) { return function (input) {
        return input === equal_to
            ? { input: input, output: input, error: null, is_valid: true }
            : { input: input, output: "", error: error, is_valid: false };
    }; },
    unique: function (error, unique_by) { return function (input) {
        unique_by = unique_by || (function (a, b) { return a === b; });
        var output = [];
        var _loop_1 = function (it) {
            if (output.some(function (item) { return unique_by(it, item); })) {
                return { value: { input: input, output: output, error: error, is_valid: false } };
            }
        };
        for (var _i = 0, input_1 = input; _i < input_1.length; _i++) {
            var it = input_1[_i];
            var state_1 = _loop_1(it);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return { input: input, output: input, error: null, is_valid: true };
    }; },
    // enum: (enums, error) =>
    //   is.some(enums.map(enu => is.equal(enu, error)), error),
    enum: function (enums, error) { return function (input) {
        if (enums.indexOf(input) < 0) {
            return { input: input, output: enums[0], error: error, is_valid: false };
        }
        return { input: input, output: input, error: null, is_valid: true };
    }; },
    // some means general either
    some: function (validates, message) { return function (input) {
        for (var _i = 0, validates_1 = validates; _i < validates_1.length; _i++) {
            var validate = validates_1[_i];
            validate = exports.pipe(validate);
            var validation = validate(input);
            if (validation.is_valid) {
                return validation;
            }
        }
        return { input: input, output: null, error: message, is_valid: false };
    }; },
    // // not that base validator
    mobile_d11: function (error) { return exports.pipe([exports.is.string(error), exports.is.match_regex(/\d{11}/g, error)]); }
};
// const is_person = is.object({
//   name: [
//     is.string("must be a string"),
//     is.length_gt(5, "length should greater than 5")
//   ],
//   age: is.optional([is.integer(true, "should be an integer")])
// });
// console.log(is_person({ name: "xia", age: 27.4 }));
// console.log(is_person({ name: "xia" }));
// console.log(is_person({ name: "xialvjun" }));
// console.log(is_person({ name: "xialvjun", age: 27 }));
// console.log(is_person({ name: "xialvjun", age: "27" }));
// console.log(is_person({ name: "xialvjun", age: 27.4 }));
