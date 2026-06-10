export function debounce<F extends (...arguments_: Parameters<F>) => ReturnType<F>>(this: unknown, function_: F, waitInMS = 0) {
    let timer: ReturnType<typeof setTimeout> | null = null
    let pendingArguments: Parameters<F> | null = null

    const cancel = () => {
        if (timer !== null) {
            clearTimeout(timer)
            timer = null
        }
        pendingArguments = null
    }

    const flush = () => {
        if (timer === null || pendingArguments === null) {
            return
        }
        const arguments_ = pendingArguments
        cancel()
        function_.apply(this, arguments_)
    }

    const debounced = (...arguments_: Parameters<F>) => {
        pendingArguments = arguments_
        if (timer !== null) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            timer = null
            pendingArguments = null
            function_.apply(this, arguments_)
        }, waitInMS)
    }

    return Object.assign(debounced, { flush, cancel })
}
