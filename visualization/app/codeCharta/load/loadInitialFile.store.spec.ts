import { TestBed } from "@angular/core/testing"
import { Action, Store, StoreModule } from "@ngrx/store"
import { CcState, DomainLensSource, DomainState } from "../model/codeCharta.model"
import { WordCloudShape, WordCloudSizingMode } from "../model/wordCloud.model"
import { DomainLensSourceReadWindow, defaultDomainLensSource } from "../stores/domainLensSource/domainLensSource.read.facade"
import { setDomainWords } from "../stores/domainLensSource/domainLensSource.write.facade"
import { DomainStateReadWindow, defaultDomainState } from "../stores/domainState/domainState.read.facade"
import {
    setDomainStateDrawOutOfBound,
    setDomainStateGridSize,
    setDomainStateRotationRange,
    setDomainStateRotationStep,
    setDomainStateShape,
    setDomainStateShrinkToFit,
    setDomainStateSizeRange,
    setDomainStateSizingMode,
    setDomainStateTopN
} from "../stores/domainState/domainState.write.facade"
import { appReducers, setStateMiddleware } from "../stores/rootStore/store"
import { LoadInitialFileStore } from "./loadInitialFile.store"

describe("LoadInitialFileStore", () => {
    let loadInitialFileStore: LoadInitialFileStore
    let dispatchSpy: jest.SpyInstance

    const savedDomainState: DomainState = {
        ...defaultDomainState,
        shape: WordCloudShape.star,
        sizeRange: [20, 80],
        rotationRange: [-45, 45],
        rotationStep: 15,
        gridSize: 16,
        sizingMode: WordCloudSizingMode.tfidf,
        topN: 42,
        shrinkToFit: false,
        drawOutOfBound: true
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

    describe("applyDomainState", () => {
        it("should dispatch the matching action for every changed domain bar setting", () => {
            // Arrange
            setup()

            // Act
            const missingKeys = loadInitialFileStore.applyDomainState(savedDomainState)

            // Assert
            expect(missingKeys).toEqual([])
            expect(dispatchedActions()).toEqual([
                setDomainStateShape({ value: savedDomainState.shape }),
                setDomainStateSizeRange({ value: savedDomainState.sizeRange }),
                setDomainStateRotationRange({ value: savedDomainState.rotationRange }),
                setDomainStateRotationStep({ value: savedDomainState.rotationStep }),
                setDomainStateGridSize({ value: savedDomainState.gridSize }),
                setDomainStateSizingMode({ value: savedDomainState.sizingMode }),
                setDomainStateTopN({ value: savedDomainState.topN }),
                setDomainStateShrinkToFit({ value: savedDomainState.shrinkToFit }),
                setDomainStateDrawOutOfBound({ value: savedDomainState.drawOutOfBound })
            ])
        })

        it("should dispatch nothing when the persisted domain bar equals the current one", () => {
            // Arrange
            setup()

            // Act
            const missingKeys = loadInitialFileStore.applyDomainState({ ...defaultDomainState })

            // Assert
            expect(missingKeys).toEqual([])
            expect(dispatchedActions()).toEqual([])
        })

        it("should dispatch only the changed setting and report the keys the persisted state lacks", () => {
            // Arrange
            setup()
            const partiallyPersistedDomainState = { topN: 42 } as DomainState

            // Act
            const missingKeys = loadInitialFileStore.applyDomainState(partiallyPersistedDomainState)

            // Assert
            expect(dispatchedActions()).toEqual([setDomainStateTopN({ value: 42 })])
            expect(missingKeys).toEqual([
                "shape",
                "sizeRange",
                "rotationRange",
                "rotationStep",
                "gridSize",
                "sizingMode",
                "shrinkToFit",
                "drawOutOfBound"
            ])
        })

        it("should throw when the current domain bar carries a key the mapper does not handle", () => {
            // Arrange
            setup([
                {
                    provide: DomainStateReadWindow,
                    useValue: { getDomainState: () => ({ ...defaultDomainState, unknownSetting: "old" }) }
                }
            ])
            const savedDomainStateWithUnknownKey = { ...defaultDomainState, unknownSetting: "new" } as DomainState

            // Act & Assert
            expect(() => loadInitialFileStore.applyDomainState(savedDomainStateWithUnknownKey)).toThrow("Unhandled key: unknownSetting")
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

        it("should dispatch nothing when an unchanged word bank is too large to serialize into one string", () => {
            // Arrange
            const oneMebibyteText = "x".repeat(2 ** 20)
            const wordsBeyondTheStringLimit = () => ({
                "/root": Array.from({ length: 600 }, () => ({ text: oneMebibyteText, frequency: 1 }))
            })
            setup([
                {
                    provide: DomainLensSourceReadWindow,
                    useValue: { getDomainLensSource: () => ({ words: wordsBeyondTheStringLimit() }) }
                }
            ])

            // Act
            const missingKeys = loadInitialFileStore.applyDomainLensSource({ words: wordsBeyondTheStringLimit() })

            // Assert
            expect(missingKeys).toEqual([])
            expect(dispatchedActions()).toEqual([])
        })

        it("should treat a persisted state without the word bank as complete, because the bank is derived", () => {
            // Arrange
            setup()

            // Act — the bank is rebuilt from the loaded files, so it is deliberately never persisted
            const missingKeys = loadInitialFileStore.applyDomainLensSource({} as DomainLensSource)

            // Assert
            expect(missingKeys).toEqual([])
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
        it("should not report the word bank the persisted state deliberately leaves out", () => {
            // Arrange
            setup()

            // Act
            const missingKeys = loadInitialFileStore.missingKeysOfDomainLensSource({} as DomainLensSource)

            // Assert — reporting it would tell the reader their session came back only partly restored
            expect(missingKeys).toEqual([])
            expect(dispatchedActions()).toEqual([])
        })
    })
})
