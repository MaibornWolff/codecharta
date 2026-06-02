export const parseNumberInput = (event: Event, min: number, max: number) => {
    const input = event.target as HTMLInputElement
    const value = Number.parseFloat(input.value)
    if (Number.isNaN(value)) {
        return value
    }
    const clamped = Math.min(Math.max(value, min), max)
    if (clamped !== value) {
        input.value = String(clamped)
    }
    return clamped
}
