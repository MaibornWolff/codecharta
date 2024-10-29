import { createSelector } from "@ngrx/store"
import { markedPackagesSelector } from "../../../state/store/fileSettings/markedPackages/markedPackages.selector"

type Path = string
export type MarkedPackagesMap = {
    [color: string]: Path[]
}

export const legendMarkedPackagesSelector = createSelector(markedPackagesSelector, markedPackages =>
    markedPackages.reduce((accumulator, { color, path }) => {
        if (!Object.prototype.hasOwnProperty.call(accumulator, color)) {
            accumulator[color] = []
        }
        accumulator[color].push(path)
        return accumulator
    }, {})
)
