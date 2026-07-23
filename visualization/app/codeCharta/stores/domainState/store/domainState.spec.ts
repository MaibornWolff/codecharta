import { STATE } from "../../../mocks/dataMocks"
import { CcState } from "../../../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudShape, WordCloudSizingMode } from "../../../model/wordCloud.model"
import { defaultDomainState } from "../domainState.read.facade"
import { setDomainStateDrawOutOfBound } from "./drawOutOfBound/drawOutOfBound.actions"
import { drawOutOfBound } from "./drawOutOfBound/drawOutOfBound.reducer"
import { setDomainStateGridSize } from "./gridSize/gridSize.actions"
import { gridSize } from "./gridSize/gridSize.reducer"
import { setDomainStateRotationRange } from "./rotationRange/rotationRange.actions"
import { rotationRange } from "./rotationRange/rotationRange.reducer"
import { setDomainStateRotationStep } from "./rotationStep/rotationStep.actions"
import { rotationStep } from "./rotationStep/rotationStep.reducer"
import { setDomainStateShape } from "./shape/shape.actions"
import { shape } from "./shape/shape.reducer"
import { setDomainStateSizeRange } from "./sizeRange/sizeRange.actions"
import { sizeRange } from "./sizeRange/sizeRange.reducer"
import { setDomainStateSizingMode } from "./sizingMode/sizingMode.actions"
import { sizingMode } from "./sizingMode/sizingMode.reducer"
import { setDomainStateTopN } from "./topN/topN.actions"
import { topN } from "./topN/topN.reducer"
import { wordCloudSettingsSelector } from "./wordCloudSettings.selector"

describe("domainState store", () => {
    describe("shape reducer", () => {
        it("should set the shape", () => {
            expect(shape(defaultWordCloudSettings.shape, setDomainStateShape({ value: WordCloudShape.star }))).toBe(WordCloudShape.star)
        })

        it("should reset to the default when the payload is undefined", () => {
            const value = undefined as unknown as WordCloudShape
            expect(shape(WordCloudShape.star, setDomainStateShape({ value }))).toBe(defaultWordCloudSettings.shape)
        })
    })

    describe("sizeRange reducer", () => {
        it("should set the size range", () => {
            expect(sizeRange(defaultWordCloudSettings.sizeRange, setDomainStateSizeRange({ value: [10, 40] }))).toEqual([10, 40])
        })
    })

    describe("rotationRange reducer", () => {
        it("should set the rotation range", () => {
            expect(rotationRange(defaultWordCloudSettings.rotationRange, setDomainStateRotationRange({ value: [0, 0] }))).toEqual([0, 0])
        })
    })

    describe("rotationStep reducer", () => {
        it("should set the rotation step", () => {
            expect(rotationStep(defaultWordCloudSettings.rotationStep, setDomainStateRotationStep({ value: 15 }))).toBe(15)
        })
    })

    describe("gridSize reducer", () => {
        it("should set the grid size", () => {
            expect(gridSize(defaultWordCloudSettings.gridSize, setDomainStateGridSize({ value: 20 }))).toBe(20)
        })
    })

    describe("sizingMode reducer", () => {
        it("should set the sizing mode", () => {
            expect(sizingMode(defaultWordCloudSettings.sizingMode, setDomainStateSizingMode({ value: WordCloudSizingMode.tfidf }))).toBe(
                WordCloudSizingMode.tfidf
            )
        })
    })

    describe("topN reducer", () => {
        it("should set the top-N", () => {
            expect(topN(defaultWordCloudSettings.topN, setDomainStateTopN({ value: 42 }))).toBe(42)
        })

        it("should reset to the default when the payload is undefined", () => {
            const value = undefined as unknown as number
            expect(topN(42, setDomainStateTopN({ value }))).toBe(defaultWordCloudSettings.topN)
        })
    })

    describe("drawOutOfBound reducer", () => {
        it("should set draw out of bound", () => {
            expect(drawOutOfBound(defaultWordCloudSettings.drawOutOfBound, setDomainStateDrawOutOfBound({ value: true }))).toBe(true)
        })

        it("should reset to the default when the payload is undefined", () => {
            const value = undefined as unknown as boolean
            expect(drawOutOfBound(true, setDomainStateDrawOutOfBound({ value }))).toBe(defaultWordCloudSettings.drawOutOfBound)
        })
    })

    describe("wordCloudSettingsSelector", () => {
        it("should compose the domain bar slices into a WordCloudSettings", () => {
            // Arrange
            const state: CcState = {
                ...STATE,
                domainState: { ...defaultDomainState, shape: WordCloudShape.diamond, topN: 25 }
            }

            // Act
            const result = wordCloudSettingsSelector(state)

            // Assert — the selector projects only the word-cloud subset, dropping the sort keys
            expect(result).toEqual({ ...defaultWordCloudSettings, shape: WordCloudShape.diamond, topN: 25 })
        })
    })
})
