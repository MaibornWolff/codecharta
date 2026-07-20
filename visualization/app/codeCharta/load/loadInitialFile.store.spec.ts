import { TestBed } from "@angular/core/testing"
import { Action, Store, StoreModule } from "@ngrx/store"
import { CcState, DomainLensSource } from "../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudSettings, WordCloudShape, WordCloudSizingMode } from "../model/wordCloud.model"
import { DomainBarReadWindow } from "../stores/domainBar/domainBar.read.facade"
import {
    setDomainBarGridSize,
    setDomainBarRotationRange,
    setDomainBarRotationStep,
    setDomainBarShape,
    setDomainBarShrinkToFit,
    setDomainBarSizeRange,
    setDomainBarSizingMode,
    setDomainBarTopN
} from "../stores/domainBar/domainBar.write.facade"
import { DomainLensSourceReadWindow, defaultDomainLensSource } from "../stores/domainLensSource/domainLensSource.read.facade"
import { setDomainWords } from "../stores/domainLensSource/domainLensSource.write.facade"
import { appReducers, setStateMiddleware } from "../stores/rootStore/store"
import { LoadInitialFileStore } from "./loadInitialFile.store"

describe("LoadInitialFileStore", () => {
    let loadInitialFileStore: LoadInitialFileStore
    let dispatchSpy: jest.SpyInstance

    /** Every domainBar setting differing from its default, so one apply hits all eight switch branches. */
    const savedDomainBar: WordCloudSettings = {
        shape: WordCloudShape.star,
        sizeRange: [20, 80],
        rotationRange: [-45, 45],
        rotationStep: 15,
        gridSize: 16,
        sizingMode: WordCloudSizingMode.tfidf,
        topN: 42,
        shrinkToFit: true
    }

    const dispatchedActions = (): Action[] => dispatchSpy.mock.calls.map(call => call[0] as Action)

    const setup = (readWindowOverrides: unknown[] = []) => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })],
            providers: readWindowOverrides
        })
        loadInitialFileStore = TestBed.inject(LoadInitialFileStore)
        dispatchSpy = jest.spyOn(TestBed.inject(Store) as Store<CcState>, "dispatch")
    }

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe("applyDomainBar", () => {
        it("should dispatch the matching action for every changed domain bar setting", () => {
            // Arrange
            setup()

            // Act
            const missingKeys = loadInitialFileStore.applyDomainBar(savedDomainBar)

            // Assert
            expect(missingKeys).toEqual([])
            expect(dispatchedActions()).toEqual([
                setDomainBarShape({ value: savedDomainBar.shape }),
                setDomainBarSizeRange({ value: savedDomainBar.sizeRange }),
                setDomainBarRotationRange({ value: savedDomainBar.rotationRange }),
                setDomainBarRotationStep({ value: savedDomainBar.rotationStep }),
                setDomainBarGridSize({ value: savedDomainBar.gridSize }),
                setDomainBarSizingMode({ value: savedDomainBar.sizingMode }),
                setDomainBarTopN({ value: savedDomainBar.topN }),
                setDomainBarShrinkToFit({ value: savedDomainBar.shrinkToFit })
            ])
        })

        it("should dispatch nothing when the persisted domain bar equals the current one", () => {
            // Arrange
            setup()

            // Act
            const missingKeys = loadInitialFileStore.applyDomainBar({ ...defaultWordCloudSettings })

            // Assert
            expect(missingKeys).toEqual([])
            expect(dispatchedActions()).toEqual([])
        })

        it("should dispatch only the changed setting and report the keys the persisted state lacks", () => {
            // Arrange
            setup()
            const partiallyPersistedDomainBar = { topN: 42 } as WordCloudSettings

            // Act
            const missingKeys = loadInitialFileStore.applyDomainBar(partiallyPersistedDomainBar)

            // Assert
            expect(dispatchedActions()).toEqual([setDomainBarTopN({ value: 42 })])
            expect(missingKeys).toEqual(["shape", "sizeRange", "rotationRange", "rotationStep", "gridSize", "sizingMode", "shrinkToFit"])
        })

        it("should throw when the current domain bar carries a key the mapper does not handle", () => {
            // Arrange
            setup([
                {
                    provide: DomainBarReadWindow,
                    useValue: { getDomainBar: () => ({ ...defaultWordCloudSettings, unknownSetting: "old" }) }
                }
            ])
            const savedDomainBarWithUnknownKey = { ...defaultWordCloudSettings, unknownSetting: "new" } as WordCloudSettings

            // Act & Assert
            expect(() => loadInitialFileStore.applyDomainBar(savedDomainBarWithUnknownKey)).toThrow("Unhandled key: unknownSetting")
        })
    })

    describe("applyDomainLensSource", () => {
        it("should dispatch the persisted word bank when it differs from the current one", () => {
            // Arrange
            setup()
            const savedDomainLensSource: DomainLensSource = { words: { "/root": [{ text: "payment", frequency: 7, tfidf: 0.5 }] } }

            // Act
            const missingKeys = loadInitialFileStore.applyDomainLensSource(savedDomainLensSource)

            // Assert
            expect(missingKeys).toEqual([])
            expect(dispatchedActions()).toEqual([setDomainWords({ value: savedDomainLensSource.words })])
        })

        it("should dispatch nothing when the persisted word bank equals the current one", () => {
            // Arrange
            setup()

            // Act
            const missingKeys = loadInitialFileStore.applyDomainLensSource({ ...defaultDomainLensSource })

            // Assert
            expect(missingKeys).toEqual([])
            expect(dispatchedActions()).toEqual([])
        })

        it("should report words as missing when the persisted state predates the domain lens", () => {
            // Arrange
            setup()

            // Act
            const missingKeys = loadInitialFileStore.applyDomainLensSource({} as DomainLensSource)

            // Assert
            expect(missingKeys).toEqual(["words"])
            expect(dispatchedActions()).toEqual([])
        })

        it("should throw when the current domain lens source carries a key the mapper does not handle", () => {
            // Arrange
            setup([
                {
                    provide: DomainLensSourceReadWindow,
                    useValue: { getDomainLensSource: () => ({ ...defaultDomainLensSource, unknownKey: "old" }) }
                }
            ])
            const savedDomainLensSourceWithUnknownKey = { ...defaultDomainLensSource, unknownKey: "new" } as DomainLensSource

            // Act & Assert
            expect(() => loadInitialFileStore.applyDomainLensSource(savedDomainLensSourceWithUnknownKey)).toThrow(
                "Unhandled key: unknownKey"
            )
        })
    })

    describe("missingKeysOfDomainLensSource", () => {
        it("should report the domain lens keys the persisted state does not have without dispatching", () => {
            // Arrange
            setup()

            // Act
            const missingKeys = loadInitialFileStore.missingKeysOfDomainLensSource({} as DomainLensSource)

            // Assert
            expect(missingKeys).toEqual(["words"])
            expect(dispatchedActions()).toEqual([])
        })
    })
})
