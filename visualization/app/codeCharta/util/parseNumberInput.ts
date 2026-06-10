/**
 * Parses the numeric value of an input event and clamps it to [min, max],
 * optionally rounding to the nearest integer for integer-only settings.
 * Returns NaN when the input is not a number.
 *
 * The input element is never written back to while the user is typing:
 * intermediate values can legitimately be out of range (the "4" while typing
 * "45" into a field with min 30) and overwriting them makes such values
 * impossible to enter. Callers that want to normalize the displayed value
 * should do so on the (change) event instead.
 */
export const parseNumberInput = (event: Event, min: number, max: number, options: { round?: boolean } = {}) => {
    const input = event.target as HTMLInputElement
    const value = Number.parseFloat(input.value)
    if (Number.isNaN(value)) {
        return value
    }
    const rounded = options.round ? Math.round(value) : value
    return Math.min(Math.max(rounded, min), max)
}
