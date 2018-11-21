import { get_path, set_path } from "@xialvjun/js-utils";

type Validation = {
  input;
  output;
  is_valid: boolean;
  error: string | object | string[] | object[];
};

// // param input is just temp data
// type Validate = (input, next?: Validate) => Validation;

// const default_next: Validate = input => ({
//   input,
//   output: input,
//   is_valid: true,
//   error: null
// });
// export const validate: (validates: Validate[]) => Validate = (
//   validates: Validate[]
// ) => input =>
//   (validates[0] || default_next)(input, validate(validates.slice(1)));

// const object = (schema: { [K in string]: Validate[] }, message) => (input, next) => {
//   if (typeof input !== "object") {
//     return { input, output: null, is_valid: false, error: message };
//   }
//   let output = null,
//     is_valid = true,
//     error = null;
//   for (const key in schema) {
//     const validation = validate(schema[key])(get_path(input, key));
//     output = set_path(output, key, validation.output);
//     is_valid = is_valid && validation.is_valid;
//     error = set_path(error, key, validation.error);
//   }
//   return { input, output, is_valid, error };
// };

// // 上面是 next 。。。

type Validate = (input) => Validation;

// 下面用 pipe
export const pipe = (validates: Validate[]) => input => {
  let output = input,
    validation: Validation = { input, output, is_valid: true, error: null };
  for (const validate of validates) {
    validation = validate(output);
    if (!validation.is_valid) {
      break;
    }
    output = validation.output;
  }
  return { ...validation, input };
};
// : { [K in string]: Validate | Validate[] }
const object = (schema, message) => input => {
  if (typeof input !== "object") {
    return { input, output: null, is_valid: false, error: message };
  }
  let output = null,
    is_valid = true,
    error = null;
  for (const key in schema) {
    const validation = pipe([].concat(schema[key]))(get_path(input, key));
    output = set_path(output, key, validation.output);
    is_valid = is_valid && validation.is_valid;
    error = set_path(error, key, validation.error);
  }
  return { input, output, is_valid, error };
}

const float = (error, is_string_ok?) => input => {
  if (typeof input === 'number' && !Number.isNaN(input)) {
    return { input, output: input, is_valid: true, error: null };
  }
  if (is_string_ok && typeof input === 'string') {
    let output = parseFloat(input);
    if (!Number.isNaN(output)) {
      return { input, output, is_valid: true, error: null };
    }
  }
  return { input, output: 0, is_valid: false, error };
}

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

const check_money = object({
  money: float('should be a number', true)
}, 'should be an object');

// console.log(check_money);
console.log(check_money({ money: 0.34 }))
console.log(check_money({ money: "asasf" }))
console.log(check_money({ money: '0.34' }))

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
