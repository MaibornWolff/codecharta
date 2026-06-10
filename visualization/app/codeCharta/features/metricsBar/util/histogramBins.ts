export function histogramBins(values: readonly number[], binCount = 12, range?: { min: number; max: number }): number[] {
    const empty = new Array(binCount).fill(0) as number[]

    const finite = toFiniteValues(values)
    if (finite.length === 0) {
        return empty
    }

    const { min, max } = resolveBounds(finite, range)
    if (max === min) {
        // degenerate axis (e.g. unary, all values identical): render one full bin so a
        // populated metric is distinguishable from "no data"
        const singleBin = empty.slice()
        singleBin[0] = 1
        return singleBin
    }

    const counts = countValuesPerBin(finite, min, max, binCount)
    return normalizeCounts(counts, empty)
}

function toFiniteValues(values: readonly number[]): number[] {
    const finite: number[] = []
    if (!values) {
        return finite
    }
    for (const value of values) {
        if (Number.isFinite(value)) {
            finite.push(value)
        }
    }
    return finite
}

function resolveBounds(finite: number[], range?: { min: number; max: number }): { min: number; max: number } {
    if (range && Number.isFinite(range.min) && Number.isFinite(range.max)) {
        return { min: range.min, max: range.max }
    }

    let min = finite[0]
    let max = finite[0]
    for (const value of finite) {
        if (value < min) {
            min = value
        }
        if (value > max) {
            max = value
        }
    }
    return { min, max }
}

function countValuesPerBin(finite: number[], min: number, max: number, binCount: number): number[] {
    const counts = new Array(binCount).fill(0) as number[]
    const span = max - min
    for (const value of finite) {
        let index = Math.floor(((value - min) / span) * binCount)
        if (index < 0) {
            index = 0
        }
        if (index >= binCount) {
            index = binCount - 1
        }
        counts[index]++
    }
    return counts
}

function normalizeCounts(counts: number[], empty: number[]): number[] {
    let maxCount = 0
    for (const count of counts) {
        if (count > maxCount) {
            maxCount = count
        }
    }
    if (maxCount === 0) {
        return empty
    }

    const denominator = Math.sqrt(maxCount)
    return counts.map(count => Math.sqrt(count) / denominator)
}
