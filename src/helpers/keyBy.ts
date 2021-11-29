export const keyBy = custom_fn => arr =>
	arr.reduce((acc, val, i) => ((acc[custom_fn(val, i)] = val), acc), {})
