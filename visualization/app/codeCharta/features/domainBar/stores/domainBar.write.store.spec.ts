import { TestBed } from "@angular/core/testing"
import { Store } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { WordCloudShape, WordCloudSizingMode } from "../../../model/wordCloud.model"
import {
    setDomainBarGridSize,
    setDomainBarRotationRange,
    setDomainBarRotationStep,
    setDomainBarShape,
    setDomainBarSizeRange,
    setDomainBarSizingMode,
    setDomainBarTopN
} from "../../../stores/domainBar/domainBar.write.facade"
import { DomainBarWriteStore } from "./domainBar.write.store"

describe("DomainBarWriteStore", () => {
    let writeStore: DomainBarWriteStore
    let dispatchSpy: jest.SpyInstance

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideMockStore()] })
        writeStore = TestBed.inject(DomainBarWriteStore)
        dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")
    })

    it("should dispatch each setter with its value", () => {
        // Act
        writeStore.setShape(WordCloudShape.star)
        writeStore.setSizeRange([10, 40])
        writeStore.setRotationRange([0, 0])
        writeStore.setRotationStep(15)
        writeStore.setGridSize(20)
        writeStore.setSizingMode(WordCloudSizingMode.tfidf)
        writeStore.setTopN(42)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setDomainBarShape({ value: WordCloudShape.star }))
        expect(dispatchSpy).toHaveBeenCalledWith(setDomainBarSizeRange({ value: [10, 40] }))
        expect(dispatchSpy).toHaveBeenCalledWith(setDomainBarRotationRange({ value: [0, 0] }))
        expect(dispatchSpy).toHaveBeenCalledWith(setDomainBarRotationStep({ value: 15 }))
        expect(dispatchSpy).toHaveBeenCalledWith(setDomainBarGridSize({ value: 20 }))
        expect(dispatchSpy).toHaveBeenCalledWith(setDomainBarSizingMode({ value: WordCloudSizingMode.tfidf }))
        expect(dispatchSpy).toHaveBeenCalledWith(setDomainBarTopN({ value: 42 }))
    })
})
