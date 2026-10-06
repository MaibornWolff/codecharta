import { DECLARATION_KIND_LEGEND, declarationKindLabelOf, declarationKindLookOf } from "./declarationKinds"

describe("declarationKinds", () => {
    it("should tell every kind apart by letter and by tint", () => {
        // Arrange
        const legend = DECLARATION_KIND_LEGEND

        // Act
        const letters = new Set(legend.map(entry => entry.letter))
        const tints = new Set(legend.map(entry => entry.tint))

        // Assert
        expect(letters.size).toBe(DECLARATION_KIND_LEGEND.length)
        expect(tints.size).toBe(DECLARATION_KIND_LEGEND.length)
    })

    it("should draw a kind named like something every object has as any other kind it does not know", () => {
        // Arrange
        const kind = "constructor"

        // Act
        const look = declarationKindLookOf(kind)

        // Assert
        expect(look).toEqual(declarationKindLookOf("other"))
        expect(declarationKindLabelOf(kind)).toBe("constructor")
    })

    it("should draw a kind it does not know, or a declaration without one, as any other", () => {
        // Arrange
        const unknownKinds = ["a_kind_of_tomorrow", undefined]

        // Act
        const looks = unknownKinds.map(declarationKindLookOf)

        // Assert
        expect(looks.map(look => look.label)).toEqual(["Other", "Other"])
    })

    it("should know the kinds the parser writes", () => {
        // Arrange
        const knownKinds = ["class", "interface", "enum", "function"]

        // Act
        const labels = knownKinds.map(kind => declarationKindLookOf(kind).label)

        // Assert
        expect(labels).toEqual(["Class", "Interface", "Enum", "Function"])
    })

    it("should name a kind it knows by its label and any other by the name its language gave it", () => {
        // Arrange
        const kinds = ["valueclass", "typealias"]

        // Act
        const labels = kinds.map(declarationKindLabelOf)

        // Assert
        expect(labels).toEqual(["Value class", "typealias"])
    })
})
