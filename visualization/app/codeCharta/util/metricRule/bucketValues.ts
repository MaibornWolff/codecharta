interface ValueBucket {
    from: number
    to: number
    count: number
    /** How many of this bucket's values the rule being edited matches. */
    matchedCount: number
}

export interface ValueDistribution {
    buckets: ValueBucket[]
    min: number
    max: number
}

const EMPTY_DISTRIBUTION: ValueDistribution = { buckets: [], min: 0, max: 0 }

/**
 * Splits values into equal-width buckets for the distribution strip, counting within each bucket
 * how many values the rule matches. A bucket straddling the threshold is what makes a bucket-level
 * "matched or not" flag lie, so the split is counted rather than inferred from the bucket bounds.
 * Values that are all the same collapse into a single bucket rather than a zero-width range.
 */
export function bucketValues(
    values: number[],
    bucketCount: number,
    isMatched: (value: number) => boolean = () => false
): ValueDistribution {
    if (values.length === 0 || bucketCount < 1) {
        return EMPTY_DISTRIBUTION
    }
    const min = Math.min(...values)
    const max = Math.max(...values)
    if (min === max) {
        return { buckets: [countInto({ from: min, to: max }, values, isMatched)], min, max }
    }

    const width = (max - min) / bucketCount
    const buckets: ValueBucket[] = Array.from({ length: bucketCount }, (_unused, index) => ({
        from: min + index * width,
        to: min + (index + 1) * width,
        count: 0,
        matchedCount: 0
    }))
    for (const value of values) {
        const index = Math.min(bucketCount - 1, Math.floor((value - min) / width))
        buckets[index].count++
        if (isMatched(value)) {
            buckets[index].matchedCount++
        }
    }
    return { buckets, min, max }
}

function countInto(bounds: { from: number; to: number }, values: number[], isMatched: (value: number) => boolean): ValueBucket {
    return { ...bounds, count: values.length, matchedCount: values.filter(value => isMatched(value)).length }
}
