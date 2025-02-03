import { clone } from "./clone"
import { dequal } from "dequal"

export function removeItemFromArray<T>(array: T[], searchItem: T) {
    return array.filter(entry => !dequal(entry, searchItem))
}

export function removeEntryAtIndexFromArray<T>(array: T[], index: number): T[] {
    return [...array.slice(0, index), ...array.slice(index + 1)]
}

export function addItemToArray<T>(array: T[], item: T): T[] {
    if (!arrayContainsItem(array, item)) {
        return [...array, clone(item)]
    }
    return array
}

export function addItemsToArray<T>(array: T[], items: T[]): T[] {
    const newArray = [...array]
    for (const item of items) {
        if (!arrayContainsItem(newArray, item)) {
            newArray.push(item)
        }
    }
    return newArray
}

export function compareContentIgnoringOrder<T>(array1: T[], array2: T[]): boolean {
    if (array1.length !== array2.length) {
        return false
    }

    let clonedArray2 = [...array2]

    return array1.every(item => {
        const index = findIndexOfItemInArray(clonedArray2, item)

        if (index >= 0) {
            clonedArray2 = removeEntryAtIndexFromArray(clonedArray2, index)
            return true
        }

        return false
    })
}

function findIndexOfItemInArray<T>(array: T[], item: T): number {
    return array.findIndex(x => dequal(x, item))
}

function arrayContainsItem<T>(array: T[], item: T) {
    return array.some(x => dequal(x, item))
}
