export function selectTopNByValue<T>(items: T[], getValue: (item: T) => number, n: number): T[] {
    const limit = Math.floor(n)
    if (Number.isNaN(limit) || limit <= 0) {
        return []
    }
    const getComparableValue = (item: T) => rankNaNBelowEveryValue(getValue(item))
    if (items.length <= limit) {
        return [...items].sort((a, b) => getComparableValue(b) - getComparableValue(a))
    }
    return collectTopWindow(items, getComparableValue, limit)
}

function rankNaNBelowEveryValue(value: number): number {
    return Number.isNaN(value) ? Number.NEGATIVE_INFINITY : value
}

function collectTopWindow<T>(items: T[], getComparableValue: (item: T) => number, limit: number): T[] {
    const window: T[] = []
    let smallestValueInWindow = Number.POSITIVE_INFINITY
    for (const item of items) {
        const value = getComparableValue(item)
        if (window.length < limit) {
            insertDescending(window, item, value, getComparableValue)
        } else if (value > smallestValueInWindow) {
            window.pop()
            insertDescending(window, item, value, getComparableValue)
        } else {
            continue
        }
        if (window.length === limit) {
            smallestValueInWindow = getComparableValue(window[limit - 1])
        }
    }
    return window
}

function insertDescending<T>(sorted: T[], item: T, value: number, getValue: (item: T) => number): void {
    let index = sorted.length
    while (index > 0 && getValue(sorted[index - 1]) < value) {
        index--
    }
    sorted.splice(index, 0, item)
}
