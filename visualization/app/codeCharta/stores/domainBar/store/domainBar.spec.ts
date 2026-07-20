import { STATE } from "../../../mocks/dataMocks"
import { CcState } from "../../../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudShape, WordCloudSizingMode } from "../../../model/wordCloud.model"
import { setDomainBarGridSize } from "./gridSize/gridSize.actions"
import { gridSize } from "./gridSize/gridSize.reducer"
import { setDomainBarRotationRange } from "./rotationRange/rotationRange.actions"
import { rotationRange } from "./rotationRange/rotationRange.reducer"
import { setDomainBarRotationStep } from "./rotationStep/rotationStep.actions"
import { rotationStep } from "./rotationStep/rotationStep.reducer"
import { setDomainBarShape } from "./shape/shape.actions"
import { shape } from "./shape/shape.reducer"
import { setDomainBarSizeRange } from "./sizeRange/sizeRange.actions"
import { sizeRange } from "./sizeRange/sizeRange.reducer"
import { setDomainBarSizingMode } from "./sizingMode/sizingMode.actions"
import { sizingMode } from "./sizingMode/sizingMode.reducer"
import { setDomainBarTopN } from "./topN/topN.actions"
import { topN } from "./topN/topN.reducer"
import { wordCloudSettingsSelector } from "./wordCloudSettings.selector"

describe("domainBar store", () => {
    describe("shape reducer", () => {
        it("should set the shape", () => {
            expect(shape(defaultWordCloudSettings.shape, setDomainBarShape({ value: WordCloudShape.star }))).toBe(WordCloudShape.star)
        })

        it("should reset to the default when the payload is undefined", () => {
            const value = undefined as unknown as WordCloudShape
            expect(shape(WordCloudShape.star, setDomainBarShape({ value }))).toBe(defaultWordCloudSettings.shape)
        })
    })

    describe("sizeRange reducer", () => {
        it("should set the size range", () => {
            expect(sizeRange(defaultWordCloudSettings.sizeRange, setDomainBarSizeRange({ value: [10, 40] }))).toEqual([10, 40])
        })
    })

    describe("rotationRange reducer", () => {
        it("should set the rotation range", () => {
            expect(rotationRange(defaultWordCloudSettings.rotationRange, setDomainBarRotationRange({ value: [0, 0] }))).toEqual([0, 0])
        })
    })

    describe("rotationStep reducer", () => {
        it("should set the rotation step", () => {
            expect(rotationStep(defaultWordCloudSettings.rotationStep, setDomainBarRotationStep({ value: 15 }))).toBe(15)
        })
    })

    describe("gridSize reducer", () => {
        it("should set the grid size", () => {
            expect(gridSize(defaultWordCloudSettings.gridSize, setDomainBarGridSize({ value: 20 }))).toBe(20)
        })
    })

    describe("sizingMode reducer", () => {
        it("should set the sizing mode", () => {
            expect(sizingMode(defaultWordCloudSettings.sizingMode, setDomainBarSizingMode({ value: WordCloudSizingMode.tfidf }))).toBe(
                WordCloudSizingMode.tfidf
            )
        })
    })

    describe("topN reducer", () => {
        it("should set the top-N", () => {
            expect(topN(defaultWordCloudSettings.topN, setDomainBarTopN({ value: 42 }))).toBe(42)
        })

        it("should reset to the default when the payload is undefined", () => {
            const value = undefined as unknown as number
            expect(topN(42, setDomainBarTopN({ value }))).toBe(defaultWordCloudSettings.topN)
        })
    })

    describe("wordCloudSettingsSelector", () => {
        it("should compose the domain bar slices into a WordCloudSettings", () => {
            // Arrange
            const state: CcState = {
                ...STATE,
                domainBar: { ...defaultWordCloudSettings, shape: WordCloudShape.diamond, topN: 25 }
            }

            // Act
            const result = wordCloudSettingsSelector(state)

            // Assert
            expect(result).toEqual({ ...defaultWordCloudSettings, shape: WordCloudShape.diamond, topN: 25 })
        })
    })
})
