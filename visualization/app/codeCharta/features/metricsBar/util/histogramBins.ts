export function histogramBins(values: readonly number[], binCount = 12, range?: { min: number; max: number }): number[] {
    const empty = new Array(binCount).fill(0) as number[]

    if (!values || values.length === 0) {
        return empty
    }

    const finite: number[] = []
    for (const value of values) {
        if (Number.isFinite(value)) {
            finite.push(value)
        }
    }
    if (finite.length === 0) {
        return empty
    }

    let min: number
    let max: number
    if (range && Number.isFinite(range.min) && Number.isFinite(range.max)) {
        min = range.min
        max = range.max
    } else {
        min = finite[0]
        max = finite[0]
        for (const value of finite) {
            if (value < min) {
                min = value
            }
            if (value > max) {
                max = value
            }
        }
    }
    if (max === min) {
        return empty
    }

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
