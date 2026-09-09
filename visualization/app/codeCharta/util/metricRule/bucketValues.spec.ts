import { bucketValues } from "./bucketValues"

describe("bucketValues", () => {
    it("should return nothing for no values", () => {
        // Arrange & Act
        const distribution = bucketValues([], 4)

        // Assert
        expect(distribution.buckets).toEqual([])
    })

    it("should place every value in a bucket", () => {
        // Arrange
        const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

        // Act
        const distribution = bucketValues(values, 5)

        // Assert
        expect(distribution.buckets.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(values.length)
    })

    it("should report the range of the values", () => {
        // Arrange & Act
        const distribution = bucketValues([3, 17, 8], 4)

        // Assert
        expect(distribution.min).toBe(3)
        expect(distribution.max).toBe(17)
    })

    it("should count the highest value into the last bucket rather than past the end", () => {
        // Arrange & Act
        const distribution = bucketValues([0, 10], 2)

        // Assert
        expect(distribution.buckets[1].count).toBe(1)
    })

    it("should collapse identical values into one bucket", () => {
        // Arrange & Act
        const distribution = bucketValues([7, 7, 7], 6)

        // Assert
        expect(distribution.buckets).toEqual([{ from: 7, to: 7, count: 3, matchedCount: 0 }])
    })

    it("should count how many of a bucket's values the rule matches", () => {
        // Arrange & Act
        const distribution = bucketValues([0, 1, 2, 3], 2, value => value >= 1)

        // Assert
        expect(distribution.buckets.map(bucket => bucket.matchedCount)).toEqual([1, 2])
    })

    it("should count matches inside a single collapsed bucket", () => {
        // Arrange & Act
        const distribution = bucketValues([7, 7], 4, () => true)

        // Assert
        expect(distribution.buckets[0].matchedCount).toBe(2)
    })

    it("should return nothing when asked for less than one bucket", () => {
        // Arrange & Act
        const distribution = bucketValues([1, 2], 0)

        // Assert
        expect(distribution.buckets).toEqual([])
    })
})
