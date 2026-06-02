/**
 * Returns the `n` items with the highest `getValue(item)`, in descending order.
 *
 * Equivalent in result to `[...items].sort((a, b) => getValue(b) - getValue(a)).slice(0, n)`
 * (ties keep their original relative order, like a stable sort), but avoids sorting the
 * whole array: it keeps only a running top-`n` window, which is far cheaper than a full
 * sort when `n` is small relative to `items.length` (e.g. a few top labels out of many
 * thousands of buildings).
 */
export function selectTopNByValue<T>(items: T[], getValue: (item: T) => number, n: number): T[] {
    if (n <= 0) {
        return []
    }
    if (items.length <= n) {
        return [...items].sort((a, b) => getValue(b) - getValue(a))
    }

    const top: T[] = []
    for (const item of items) {
        const value = getValue(item)
        if (top.length < n) {
            insertDescending(top, item, value, getValue)
        } else if (value > getValue(top[n - 1])) {
            top.pop()
            insertDescending(top, item, value, getValue)
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
