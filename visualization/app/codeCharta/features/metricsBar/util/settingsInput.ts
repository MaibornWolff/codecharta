import { parseNumberInput } from "../../../util/parseNumberInput"

/** Debounce delay (ms) shared by the metrics-bar settings popover number inputs. */
export const SETTINGS_INPUT_DEBOUNCE_MS = 400

/**
 * Parses a numeric input event and clamps it to [min, max] (via parseNumberInput),
 * returning the value only when it is a valid number that differs from currentValue.
 * Returns undefined when the input is not a number or is unchanged, so callers can skip dispatching.
 */
export function parseChangedNumberInput(event: Event, min: number, max: number, currentValue: number): number | undefined {
    const value = parseNumberInput(event, min, max)
    if (Number.isNaN(value) || value === currentValue) {
        return undefined
    }
    return value
}
