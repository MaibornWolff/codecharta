export const parseNumberInput = (event: Event, min: number, max: number, options: { round?: boolean } = {}) => {
    const input = event.target as HTMLInputElement
    const typedValue = Number.parseFloat(input.value)
    if (Number.isNaN(typedValue)) {
        return typedValue
    }
    return clamp(options.round ? Math.round(typedValue) : typedValue, min, max)
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}
