import { addItemToArray, compareContentIgnoringOrder, removeItemFromArray } from "./arrayHelper"

function mutateObject(object: Record<string, number>) {
    object.x = 10_000
}

describe("arrayHelper", () => {
    let object1: { x: number; y: number }
    let object2: { x: number; y: number }
    let array: { x: number; y: number }[]

    beforeEach(() => {
        object1 = { x: 1, y: 2 }
        object2 = { x: 3, y: 4 }
        array = []
    })

    describe("removeItemFromArray", () => {
        it("should deepClone an array and remove the item", () => {
            array.push(object1, object2)

            const result = removeItemFromArray(array, object1)
            mutateObject(object1)

            expect(result).toEqual([{ x: 3, y: 4 }])
        })
    })

    describe("addItemToArray", () => {
        it("should shallow copy an array and push a cloned item to it", () => {
            array.push(object1)

            const result = addItemToArray(array, object2)
            mutateObject(object1)
            mutateObject(object2)

            expect(result).toEqual([
                { x: 10_000, y: 2 },
                { x: 3, y: 4 }
            ])
        })
    })

    describe("compareContentIgnoringOrder", () => {
        it("should return true for arrays with the same contents", () => {
            const array1 = [
                { x: 1, y: 2 },
                { x: 3, y: 4 }
            ]
            const array2 = [
                { x: 1, y: 2 },
                { x: 3, y: 4 }
            ]

            const result = compareContentIgnoringOrder(array1, array2)

            expect(result).toBe(true)
        })

        it("should return false for arrays with different contents", () => {
            const array1 = [{ x: 1, y: 2 }]
            const array2 = [{ x: 3, y: 4 }]

            const result = compareContentIgnoringOrder(array1, array2)

            expect(result).toBe(false)
        })

        it("should return true for arrays with the same contents in different orders", () => {
            const array1 = [
                { x: 3, y: 4 },
                { x: 1, y: 2 }
            ]
            const array2 = [
                { x: 1, y: 2 },
                { x: 3, y: 4 }
            ]

            const result = compareContentIgnoringOrder(array1, array2)

            expect(result).toBe(true)
        })

        it("should return false for arrays with different length", () => {
            const array1 = [{ x: 3, y: 4 }]
            const array2 = [
                { x: 3, y: 4 },
                { x: 3, y: 4 }
            ]

            const result1 = compareContentIgnoringOrder(array1, array2)
            const result2 = compareContentIgnoringOrder(array2, array1)

            expect(result1).toBe(false)
            expect(result2).toBe(false)
        })

        it("should return true for empty arrays", () => {
            const array1 = []
            const array2 = []

            const result = compareContentIgnoringOrder(array1, array2)

            expect(result).toBe(true)
        })

        it("should return false for arrays containing duplicate elements", () => {
            const array1 = [
                { x: 1, y: 2 },
                { x: 1, y: 2 },
                { x: 1, y: 3 }
            ]
            const array2 = [
                { x: 1, y: 2 },
                { x: 1, y: 3 },
                { x: 1, y: 3 }
            ]

            const result1 = compareContentIgnoringOrder(array1, array2)
            const result2 = compareContentIgnoringOrder(array2, array1)

            expect(result1).toBe(false)
            expect(result2).toBe(false)
        })
    })
})
