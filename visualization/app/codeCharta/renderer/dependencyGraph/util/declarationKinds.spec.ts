import { DECLARATION_KIND_LEGEND, declarationKindLabelOf, declarationKindLookOf } from "./declarationKinds"

describe("declarationKinds", () => {
    it("should tell every kind apart by letter and by tint", () => {
        // Act
        const letters = new Set(DECLARATION_KIND_LEGEND.map(entry => entry.letter))
        const tints = new Set(DECLARATION_KIND_LEGEND.map(entry => entry.tint))

        // Assert
        expect(letters.size).toBe(DECLARATION_KIND_LEGEND.length)
        expect(tints.size).toBe(DECLARATION_KIND_LEGEND.length)
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

    it("should name a kind it knows by its label and any other by the name its language gave it", () => {
        // Act
        const labels = ["valueclass", "typealias"].map(declarationKindLabelOf)

        // Assert
        expect(labels).toEqual(["Value class", "typealias"])
    })
})
