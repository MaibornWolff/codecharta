/**
 * Returns the `n` items with the highest `getValue(item)`, in descending order.
 *
 * Equivalent in result to `[...items].sort((a, b) => getValue(b) - getValue(a)).slice(0, n)`
 * (ties keep their original relative order, like a stable sort), but avoids sorting the
 * whole array: it keeps only a running top-`n` window, which is far cheaper than a full
 * sort when `n` is small relative to `items.length` (e.g. a few top labels out of many
 * thousands of buildings).
 *
 * `n` is floored to an integer (settings restored from a URL can carry fractional values)
 * and NaN values rank below every real value instead of poisoning the comparison window.
 */
export function selectTopNByValue<T>(items: T[], getValue: (item: T) => number, n: number): T[] {
    const limit = Math.floor(n)
    if (!(limit > 0)) {
        return []
    }
    const getComparableValue = (item: T) => {
        const value = getValue(item)
        return Number.isNaN(value) ? Number.NEGATIVE_INFINITY : value
    }
    if (items.length <= limit) {
        return [...items].sort((a, b) => getComparableValue(b) - getComparableValue(a))
    }

    const top: T[] = []
    // cache the window's smallest value so the common case (value not in the top n)
    // costs one comparison instead of re-reading the boundary item every iteration
    let boundaryValue = Number.POSITIVE_INFINITY
    for (const item of items) {
        const value = getComparableValue(item)
        if (top.length < limit) {
            insertDescending(top, item, value, getComparableValue)
            if (top.length === limit) {
                boundaryValue = getComparableValue(top[limit - 1])
            }
        } else if (value > boundaryValue) {
            top.pop()
            insertDescending(top, item, value, getComparableValue)
            boundaryValue = getComparableValue(top[limit - 1])
        }
    }
    return top
}

function insertDescending<T>(sorted: T[], item: T, value: number, getValue: (item: T) => number): void {
    let index = sorted.length
    while (index > 0 && getValue(sorted[index - 1]) < value) {
        index--
    }
    sorted.splice(index, 0, item)
}
