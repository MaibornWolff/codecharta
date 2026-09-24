import { RadialFolderStyle } from "../../../../model/codeCharta.model"
import { NEUTRAL_FOLDER_COLOR, tintColor } from "../../../../util/radialFolderValues"
import { defaultState } from "../../../rootStore/state.manager"
import { isRadialFolderNeutralSelector } from "../radialFolderStyle/radialFolderStyle.selector"
import { radialFolderSwatchSelector, radialTintedFolderSwatchSelector } from "./radialFolderSwatch.selector"

const MAP_COLORS = defaultState.mapState.mapColors

describe("radialFolderSwatchSelector", () => {
    it("should show the tinted traffic light while folders are tinted", () => {
        // Act
        const swatch = radialFolderSwatchSelector.projector(MAP_COLORS, RadialFolderStyle.Tinted, 0.5)

        // Assert
        expect(swatch).toBe(
            `linear-gradient(90deg, ${[MAP_COLORS.positive, MAP_COLORS.neutral, MAP_COLORS.negative].map(color => tintColor(color, 0.5)).join(", ")})`
        )
    })

    it("should show the neutral grey while folders are neutral", () => {
        // Act
        const swatch = radialFolderSwatchSelector.projector(MAP_COLORS, RadialFolderStyle.Neutral, 0.5)

        // Assert
        expect(swatch).toBe(NEUTRAL_FOLDER_COLOR)
    })
})

describe("radialTintedFolderSwatchSelector", () => {
    it("should show the tinted traffic light whatever the folder style", () => {
        // Act
        const swatch = radialTintedFolderSwatchSelector.projector(MAP_COLORS, 0.5)

        // Assert
        expect(swatch).toBe(radialFolderSwatchSelector.projector(MAP_COLORS, RadialFolderStyle.Tinted, 0.5))
    })
})

describe("isRadialFolderNeutralSelector", () => {
    it("should tell neutral folders from tinted ones", () => {
        // Act
        const results = [RadialFolderStyle.Neutral, RadialFolderStyle.Tinted].map(style => isRadialFolderNeutralSelector.projector(style))

        // Assert
        expect(results).toEqual([true, false])
    })
})
