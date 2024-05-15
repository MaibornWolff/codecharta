import { clone } from "./clone"
import { dequal } from "dequal"

export function removeItemFromArray<T>(array: T[], searchItem: T) {
    return array.filter(entry => !dequal(entry, searchItem))
}

export function removeEntryAtIndexFromArray<T>(array: T[], index: number) {
    return [...array.slice(0, index), ...array.slice(index + 1)]
}

export function addItemToArray<T>(array: T[], item: T) {
    if (!arrayContainsItem(array, item)) {
        return [...array, clone(item)]
    }
    return array
}

export function addItemsToArray<T>(array: T[], items: T[]) {
    const newArray = [...array]
    for (const item of items) {
        if (!arrayContainsItem(newArray, item)) {
            newArray.push(item)
        }
    }
    return newArray
}

function arrayContainsItem<T>(array: T[], item: T) {
    return array.some(x => dequal(x, item))
}
