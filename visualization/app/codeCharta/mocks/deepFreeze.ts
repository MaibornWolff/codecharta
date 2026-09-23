export function deepFreeze<T>(value: T): T {
    if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
        return value
    }
    Object.freeze(value)
    for (const property of Object.values(value)) {
        deepFreeze(property)
    }
    return value
}
