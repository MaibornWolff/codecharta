import { TestBed } from "@angular/core/testing"
import { Action, Store, StoreModule } from "@ngrx/store"
import { CcState, DomainLensSource } from "../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudSettings, WordCloudShape, WordCloudSizingMode } from "../model/wordCloud.model"
import { DomainLensSourceReadWindow, defaultDomainLensSource } from "../stores/domainLensSource/domainLensSource.read.facade"
import { setDomainWords } from "../stores/domainLensSource/domainLensSource.write.facade"
import { DomainStateReadWindow } from "../stores/domainState/domainState.read.facade"
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

    /** Every domainState setting differing from its default, so one apply hits all nine switch branches. */
    const savedDomainState: WordCloudSettings = {
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
            const missingKeys = loadInitialFileStore.applyDomainState({ ...defaultWordCloudSettings })

            // Assert
            expect(missingKeys).toEqual([])
            expect(dispatchedActions()).toEqual([])
        })

        it("should dispatch only the changed setting and report the keys the persisted state lacks", () => {
            // Arrange
            setup()
            const partiallyPersistedDomainState = { topN: 42 } as WordCloudSettings

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
                    useValue: { getDomainState: () => ({ ...defaultWordCloudSettings, unknownSetting: "old" }) }
                }
            ])
            const savedDomainStateWithUnknownKey = { ...defaultWordCloudSettings, unknownSetting: "new" } as WordCloudSettings

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
