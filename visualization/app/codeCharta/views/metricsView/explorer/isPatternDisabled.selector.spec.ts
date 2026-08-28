import { BlacklistItem } from "../../../model/codeCharta.model"
import { isExcludePatternDisabledSelector, isFlattenPatternDisabledSelector } from "./isPatternDisabled.selector"

const BLACKLIST: BlacklistItem[] = [
    { type: "flatten", path: "*alreadyFlattened*" },
    { type: "exclude", path: "*alreadyExcluded*" }
]

describe("isFlattenPatternDisabledSelector", () => {
    it("should disable flattening while the search pattern is empty", () => {
        // Arrange & Act
        const isDisabled = isFlattenPatternDisabledSelector.projector("", true, BLACKLIST)

        // Assert
        expect(isDisabled).toBe(true)
    })

    it("should disable flattening for a pattern that is already a flatten rule", () => {
        // Arrange & Act
        const isDisabled = isFlattenPatternDisabledSelector.projector("alreadyFlattened", false, BLACKLIST)

        // Assert
        expect(isDisabled).toBe(true)
    })

    it("should enable flattening for a pattern that is not a flatten rule yet", () => {
        // Arrange & Act
        const isDisabled = isFlattenPatternDisabledSelector.projector("needle", false, BLACKLIST)

        // Assert
        expect(isDisabled).toBe(false)
    })

    it("should enable flattening for a pattern that is only an exclude rule", () => {
        // Arrange & Act
        const isDisabled = isFlattenPatternDisabledSelector.projector("alreadyExcluded", false, BLACKLIST)

        // Assert
        expect(isDisabled).toBe(false)
    })
})

describe("isExcludePatternDisabledSelector", () => {
    it("should disable excluding while the search pattern is empty", () => {
        // Arrange & Act
        const isDisabled = isExcludePatternDisabledSelector.projector("", true, BLACKLIST)

        // Assert
        expect(isDisabled).toBe(true)
    })

    it("should disable excluding for a pattern that is already an exclude rule", () => {
        // Arrange & Act
        const isDisabled = isExcludePatternDisabledSelector.projector("alreadyExcluded", false, BLACKLIST)

        // Assert
        expect(isDisabled).toBe(true)
    })

    it("should enable excluding for a pattern that is not an exclude rule yet", () => {
        // Arrange & Act
        const isDisabled = isExcludePatternDisabledSelector.projector("needle", false, BLACKLIST)

        // Assert
        expect(isDisabled).toBe(false)
    })

    it("should enable excluding for a pattern that is only a flatten rule", () => {
        // Arrange & Act
        const isDisabled = isExcludePatternDisabledSelector.projector("alreadyFlattened", false, BLACKLIST)

        // Assert
        expect(isDisabled).toBe(false)
    })
})
