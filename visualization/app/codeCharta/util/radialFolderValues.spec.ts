import { RadialFolderValue } from "../model/codeCharta.model"
import { describeRadialFolderValue, mixColors, RADIAL_FOLDER_VALUES, RadialFolderScale, tintColor } from "./radialFolderValues"

describe("radialFolderValues", () => {
    it("should describe every folder value exactly once", () => {
        // Act
        const described = RADIAL_FOLDER_VALUES.map(descriptor => descriptor.value)

        // Assert
        expect(described).toEqual(Object.values(RadialFolderValue))
    })

    it("should put only share ÷ size and share of red on their own scale", () => {
        // Act
        const ownScale = RADIAL_FOLDER_VALUES.filter(descriptor => descriptor.scale === RadialFolderScale.OwnScale)

        // Assert
        expect(ownScale.map(descriptor => descriptor.value)).toEqual([RadialFolderValue.ShareBySize, RadialFolderValue.ShareOfRed])
    })

    it("should label its scale in the legend of an own-scale value", () => {
        // Act
        const legends = [RadialFolderValue.ShareBySize, RadialFolderValue.ShareOfRed].map(value => describeRadialFolderValue(value).legend)

        // Assert
        expect(legends).toEqual(["share ÷ size (1× – 3×)", "share of lines in red files (0 – 50 %)"])
    })

    it("should mix a colour toward white by the tint strength", () => {
        // Act
        const tints = [1, 0.5, 0].map(tint => tintColor("#69AE40", tint))

        // Assert
        expect(tints).toEqual(["#69ae40", "#b4d7a0", "#ffffff"])
    })

    it("should mix two colours by a fraction", () => {
        // Act
        const mixed = mixColors("#000000", "#ffffff", 0.25)

        // Assert
        expect(mixed).toBe("#404040")
    })
})
