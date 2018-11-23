import {
  get_path,
  set_path,
  deep_flatten,
  to_string
} from "@xialvjun/js-utils";

interface Validation {
  input;
  output;
  error;
  is_valid: boolean;
}

interface Validate {
  (input): Validation;
}

interface Validates extends Array<Validate | Validates> {}

type ValidateGroup = Validate | Validates;

export const pipe = (validates: ValidateGroup): Validate => input => {
  validates = deep_flatten(validates);
  let output = input,
    validation: Validation = { input, output, error: null, is_valid: true };
  for (const validate of validates as Validate[]) {
    validation = validate(output);
    if (!validation.is_valid) {
      break;
    }
    output = validation.output;
  }
  return { ...validation, input };
};

export const is = {
  // optional 可以设置默认值
  optional: (
    validates: ValidateGroup,
    default_value,
    default_generator
  ): Validate => input => {
    if (
      [undefined, null, "", 0].indexOf(input) > -1 ||
      (to_string(input) === "[object Array]" && input.length === 0)
    ) {
      let output = default_generator
        ? default_generator()
        : typeof default_value !== "undefined"
        ? default_value
        : input;
      return { input, output, error: null, is_valid: true };
    }
    const validate = pipe(validates);
    return validate(input);
  },
  object: (
    schema: { [name: string]: ValidateGroup },
    message: string = "it must be an object"
  ): Validate => input => {
    let output = {};
    if (to_string(input) !== "[object Object]") {
      return { input, output, error: message, is_valid: false };
    }
    let error = null,
      is_valid = true;
    for (const name in schema) {
      const validation = pipe(schema[name])(get_path(input, name));
      output = set_path(output, name, validation.output);
      error = set_path(error, name, validation.error);
      is_valid = is_valid && validation.is_valid;
    }
    return { input, output, error, is_valid };
  },
  array: (
    validates: ValidateGroup,
    message: string = "it must be an array"
  ): Validate => input => {
    let output = [];
    if (to_string(input) !== "[object Array]") {
      return { input, output, error: message, is_valid: false };
    }
    let error = null,
      is_valid = true;
    const validate = pipe(validates);
    input.forEach((it, idx) => {
      const validation = validate(it);
      output = set_path(output, idx + "", validation.output);
      error = set_path(error, idx + "", validation.error);
      is_valid = is_valid && validation.is_valid;
    });
    return { input, output, error, is_valid };
  },
  float: (is_string_ok, error): Validate => input => {
    if (typeof input === "number" && !Number.isNaN(input)) {
      return { input, output: input, error: null, is_valid: true };
    }
    if (is_string_ok && typeof input === "string") {
      let output = parseFloat(input);
      if (!Number.isNaN(output)) {
        return { input, output, error: null, is_valid: true };
      }
    }
    return { input, output: 0, error, is_valid: false };
  },
  integer: (is_string_ok, error) =>
    pipe([
      is.float(is_string_ok, error),
      input => {
        if (Number.isInteger(input)) {
          return { input, output: input, error: null, is_valid: true };
        }
        return { input, output: 0, error, is_valid: false };
      }
    ]),
  string: (error): Validate => input =>
    to_string(input) === "[object String]"
      ? { input, output: input, error: null, is_valid: true }
      : { input, output: "", error, is_valid: false },
  length_gt: (min, error): Validate => input =>
    input.length > min
      ? { input, output: input, error: null, is_valid: true }
      : { input, output: "", error, is_valid: false },
  length_lt: (max, error): Validate => input =>
    input.length > max
      ? { input, output: input, error: null, is_valid: true }
      : { input, output: "", error, is_valid: false },
  length_e: (len, error): Validate => input =>
    input.length === len
      ? { input, output: input, error: null, is_valid: true }
      : { input, output: "", error, is_valid: false },
  match_regex: (regex, error): Validate => input => {
    if (input.match(regex)) {
      return { input, output: input, error: null, is_valid: true };
    }
    return { input, output: "", error, is_valid: false };
  },
  gt: (min, error): Validate => input =>
    input > min
      ? { input, output: input, error: null, is_valid: true }
      : { input, output: "", error, is_valid: false },
  lt: (max, error): Validate => input =>
    input > max
      ? { input, output: input, error: null, is_valid: true }
      : { input, output: "", error, is_valid: false },
  equal: (equal_to, error): Validate => input =>
    input === equal_to
      ? { input, output: input, error: null, is_valid: true }
      : { input, output: "", error, is_valid: false },
  unique: (error, unique_by): Validate => input => {
    unique_by = unique_by || ((a, b) => a === b);
    const output = [];
    for (const it of input) {
      if (output.some(item => unique_by(it, item))) {
        return { input, output, error, is_valid: false };
      }
    }
    return { input, output: input, error: null, is_valid: true };
  },
  // enum: (enums, error) =>
  //   is.some(enums.map(enu => is.equal(enu, error)), error),
  enum: (enums, error): Validate => input => {
    if (enums.indexOf(input) < 0) {
      return { input, output: enums[0], error, is_valid: false };
    }
    return { input, output: input, error: null, is_valid: true };
  },
  // some means general either
  some: (validates: Validates, message): Validate => input => {
    for (let validate of validates) {
      validate = pipe(validate);
      const validation = validate(input);
      if (validation.is_valid) {
        return validation;
      }
    }
    return { input, output: null, error: message, is_valid: false };
  },
  // // not that base validator
  mobile_d11: (error): Validate => pipe([is.string(error), is.match_regex(/\d{11}/g, error)])
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
