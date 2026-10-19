import { defaultSorting } from "../../../preferences/preferences.read.facade"

// v12: sortingOption + sortingOrderAscending → preferences.sorting = { option, orderAscending }
export function migrateCcStateRecordToV12<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const preferences = record["preferences"]
    if (!preferences || typeof preferences !== "object") {
        return state
    }
    const trimmed = { ...(preferences as Record<string, unknown>) }
    const option = "sortingOption" in trimmed ? trimmed["sortingOption"] : defaultSorting.option
    const orderAscending = "sortingOrderAscending" in trimmed ? trimmed["sortingOrderAscending"] : defaultSorting.orderAscending
    delete trimmed["sortingOption"]
    delete trimmed["sortingOrderAscending"]
    trimmed["sorting"] = { option, orderAscending }
    return { ...record, preferences: trimmed } as T
}
