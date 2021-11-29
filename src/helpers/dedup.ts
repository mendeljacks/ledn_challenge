// Remove duplicate values from an array
export const dedup = (fn, arr) => arr.filter((el, i) => !arr.slice(0, i).map(fn).includes(fn(el)))