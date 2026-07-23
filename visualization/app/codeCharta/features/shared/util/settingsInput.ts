import { parseNumberInput } from "../../../util/parseNumberInput"

export const SETTINGS_INPUT_DEBOUNCE_MS = 400

export function parseChangedNumberInput(event: Event, min: number, max: number, currentValue: number): number | undefined {
    const value = parseNumberInput(event, min, max)
    if (Number.isNaN(value) || value === currentValue) {
        return undefined
    }
    return value
}
