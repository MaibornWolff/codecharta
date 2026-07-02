import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

// markingColors is persisted and some browsers restore it as an object with numeric
// keys instead of a string[]; coerce it back so every consumer can rely on an array.
const toMarkingColorsArray = (markingColors: string[] | Record<string, string>): string[] =>
    Array.isArray(markingColors) ? markingColors : Object.values(markingColors ?? {})

const storedMapColorsSelector = createSelector(mapStateSelector, mapState => mapState.mapColors)

export const mapColorsSelector = createSelector(storedMapColorsSelector, mapColors => ({
    ...mapColors,
    markingColors: toMarkingColorsArray(mapColors.markingColors)
}))
