export const OrderBy = <T>(array: Array<T>, funcs?: Array<(item: T) => number | string>): Array<T> => {
  const newArray = array.slice();
  if (!funcs) {
    newArray.sort();
  } else {
    newArray.sort((a: T, b: T) => {
      let result = 0;
      for (let index = 0; index < funcs.length; index++) {
        const func = funcs[index];
        if (func(a) < func(b)) {
          result = -1;
          break;
        } else if (func(a) > func(b)) {
          result = 1;
          break;
        }
      }
      return result;
    });
  }
  return newArray;
};
