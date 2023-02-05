export const debounce = <F extends (...arguments_: Parameters<F>) => ReturnType<F>>(f: F, waitInMS = 300) => {
	let timer: NodeJS.Timeout
	return (...arguments_: Parameters<F>) => {
		clearTimeout(timer)
		timer = setTimeout(() => f(...arguments_), waitInMS)
	}
}
