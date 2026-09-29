export function addToGroup<Key, Member>(groups: Map<Key, Member[]>, key: Key, member: Member): void {
    const group = groups.get(key)
    if (group) {
        group.push(member)
    } else {
        groups.set(key, [member])
    }
}

// Spreading a long list into Math.min or Math.max overflows the call stack.
export function minOf(values: readonly number[]): number {
    return values.reduce((smallest, value) => Math.min(smallest, value), Number.POSITIVE_INFINITY)
}

export function maxOf(values: readonly number[]): number {
    return values.reduce((largest, value) => Math.max(largest, value), Number.NEGATIVE_INFINITY)
}
