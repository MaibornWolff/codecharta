export function debounce<F extends (...arguments_: Parameters<F>) => ReturnType<F>>(this: unknown, function_: F, waitInMS = 300) {
	let timer
	return (...arguments_: Parameters<F>) => {
		clearTimeout(timer)
		timer = timer = setTimeout(() => function_.apply(this, arguments_), waitInMS)
	}
}
