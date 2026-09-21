import { NodeRule } from "../../../model/codeCharta.model"
import { isExcludePatternDisabledSelector, isFlattenPatternDisabledSelector } from "./isPatternDisabled.selector"

const FLATTENED_NODES: NodeRule[] = [{ path: "*alreadyFlattened*" }]
const EXCLUDED_NODES: NodeRule[] = [{ path: "*alreadyExcluded*" }]

describe("isFlattenPatternDisabledSelector", () => {
    it("should disable flattening while the search pattern is empty", () => {
        // Arrange & Act
        const isDisabled = isFlattenPatternDisabledSelector.projector("", true, FLATTENED_NODES)

        // Assert
        expect(isDisabled).toBe(true)
    })

    it("should disable flattening for a pattern that is already a flatten rule", () => {
        // Arrange & Act
        const isDisabled = isFlattenPatternDisabledSelector.projector("alreadyFlattened", false, FLATTENED_NODES)

        // Assert
        expect(isDisabled).toBe(true)
    })

    it("should enable flattening for a pattern that is not a flatten rule yet", () => {
        // Arrange & Act
        const isDisabled = isFlattenPatternDisabledSelector.projector("needle", false, FLATTENED_NODES)

        // Assert
        expect(isDisabled).toBe(false)
    })

    it("should enable flattening for a pattern the flatten list does not hold", () => {
        // Arrange & Act — an excluded pattern sits in a different list, so it cannot disable flattening
        const isDisabled = isFlattenPatternDisabledSelector.projector("alreadyExcluded", false, FLATTENED_NODES)

        // Assert
        expect(isDisabled).toBe(false)
    })
})

describe("isExcludePatternDisabledSelector", () => {
    it("should disable excluding while the search pattern is empty", () => {
        // Arrange & Act
        const isDisabled = isExcludePatternDisabledSelector.projector("", true, EXCLUDED_NODES)

        // Assert
        expect(isDisabled).toBe(true)
    })

    it("should disable excluding for a pattern that is already an exclude rule", () => {
        // Arrange & Act
        const isDisabled = isExcludePatternDisabledSelector.projector("alreadyExcluded", false, EXCLUDED_NODES)

        // Assert
        expect(isDisabled).toBe(true)
    })

    it("should enable excluding for a pattern that is not an exclude rule yet", () => {
        // Arrange & Act
        const isDisabled = isExcludePatternDisabledSelector.projector("needle", false, FLATTENED_NODES)

        // Assert
        expect(isDisabled).toBe(false)
    })

    it("should enable excluding for a pattern the exclude list does not hold", () => {
        // Arrange & Act — a flattened pattern sits in a different list, so it cannot disable excluding
        const isDisabled = isExcludePatternDisabledSelector.projector("alreadyFlattened", false, EXCLUDED_NODES)

        // Assert
        expect(isDisabled).toBe(false)
    })
})
