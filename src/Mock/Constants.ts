export const Regex = {
  Operation: /\s[\w\d_]*\.([\w\d$_]*)\(([\w\W\d$_]*)\)/,
  Property: /\s[\w\d_]*\.([\w\d$_]*)/,
  Params: /({.*?}|[^,]+)/g
};
