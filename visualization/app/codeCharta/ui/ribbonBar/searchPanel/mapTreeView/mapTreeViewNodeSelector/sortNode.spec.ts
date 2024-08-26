import { klona } from "klona"
import {
    VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS,
    VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS_SORTED,
    VALID_NODE_WITH_MULTIPLE_FOLDERS,
    VALID_NODE_WITH_MULTIPLE_FOLDERS_REVERSED,
    VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_NAME,
    VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_UNARY
} from "../../../../../util/dataMocks"
import { SortingOption } from "../../../../../codeCharta.model"
import { sortNode } from "./sortNode"

describe("sortNode", () => {
    it("should reverse order if 'sortingOrderAscending' is false", () => {
        const node = klona(VALID_NODE_WITH_MULTIPLE_FOLDERS)
        expect(sortNode(node, SortingOption.NAME, false)).toEqual(VALID_NODE_WITH_MULTIPLE_FOLDERS_REVERSED)
    })

    it("should sort by name, if sortingOption is set to SortingOption.NAME", () => {
        const node = klona(VALID_NODE_WITH_MULTIPLE_FOLDERS)
        expect(sortNode(node, SortingOption.NAME, true)).toEqual(VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_NAME)
    })

    it("should sort by unary value, if sortingOption is set to SortingOption.NUMBER_OF_FILES", () => {
        const node = klona(VALID_NODE_WITH_MULTIPLE_FOLDERS)
        expect(sortNode(node, SortingOption.NUMBER_OF_FILES, false)).toEqual(VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_UNARY)
    })

    it("should sort according to name accounting for numbers", () => {
        const node = klona(VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS)
        expect(sortNode(node, SortingOption.NAME, true)).toEqual(VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS_SORTED)
    })
})
