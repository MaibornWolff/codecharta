import { DECLARATION_KIND_LEGEND, declarationKindLookOf } from "./declarationKinds"

describe("declarationKinds", () => {
    it("should tell every kind apart by letter and by colour", () => {
        // Act
        const letters = new Set(DECLARATION_KIND_LEGEND.map(entry => entry.letter))
        const colors = new Set(DECLARATION_KIND_LEGEND.map(entry => entry.color))

        // Assert
        expect(letters.size).toBe(DECLARATION_KIND_LEGEND.length)
        expect(colors.size).toBe(DECLARATION_KIND_LEGEND.length)
    })

    it("should draw a kind it does not know, or a declaration without one, as any other", () => {
        // Act
        const looks = ["a_kind_of_tomorrow", undefined].map(declarationKindLookOf)

        // Assert
        expect(looks.map(look => look.label)).toEqual(["Other", "Other"])
    })

    it("should know the kinds the parser writes", () => {
        // Act
        const labels = ["class", "interface", "enum", "function"].map(kind => declarationKindLookOf(kind).label)

        // Assert
        expect(labels).toEqual(["Class", "Interface", "Enum", "Function"])
    })
})
