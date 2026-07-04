import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { EffectsModule } from "@ngrx/effects"
import { provideMockStore, MockStore } from "@ngrx/store/testing"
import { setState } from "../../../store/state.actions"
import { UpdateFileSettingsEffect } from "./updateFileSettings.effect"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { TEST_FILE_DATA, TEST_FILE_DATA_JAVA, TEST_FILE_DATA_TWO } from "../../../mocks/dataMocks"
import { FileSelectionState } from "../../../model/files/files"
import { visibleFileStatesSelector } from "../../../fileStore/store/visibleFileStates.selector"

describe("UpdateFileSettingsEffect", () => {
    const modifiedDefaultState = {
        files: [
            { selectedAs: FileSelectionState.Reference, file: TEST_FILE_DATA },
            { selectedAs: FileSelectionState.Reference, file: TEST_FILE_DATA_TWO },
            { selectedAs: FileSelectionState.None, file: TEST_FILE_DATA_JAVA }
        ]
    }

    let store: MockStore

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([UpdateFileSettingsEffect])],
            providers: [
                { provide: State, useValue: { getValue: () => modifiedDefaultState } },
                provideMockStore({
                    selectors: [
                        {
                            selector: visibleFileStatesSelector,
                            value: [
                                { selectedAs: FileSelectionState.Reference, file: TEST_FILE_DATA },
                                { selectedAs: FileSelectionState.Reference, file: TEST_FILE_DATA_TWO }
                            ]
                        }
                    ]
                })
            ]
        })
        store = TestBed.inject(MockStore)
    })

    it("should update fileSettings when files have changed", async () => {
        store.overrideSelector(visibleFileStatesSelector, [{ selectedAs: FileSelectionState.Reference, file: TEST_FILE_DATA_TWO }])
        store.refreshState()

        const { attributeTypes, attributeDescriptors, blacklist, markedPackages } = TEST_FILE_DATA_TWO.settings.fileSettings
        expect(await getLastAction(store)).toEqual(
            setState({
                value: {
                    // Slice 15e: edges left this effect (now a derived dependency-lens selector), so no fileSettings key.
                    // Slice 9b+9c: the merged blacklist + markedPackages are co-emitted under sharedView (not fileSettings).
                    sharedView: { blacklist, markedPackages },
                    // Slice 14: the full attributeTypes is split — node types to the metrics lens, edge types to the dependency lens.
                    metricsLensSource: { attributeTypes: { nodes: attributeTypes.nodes, edges: {} }, attributeDescriptors },
                    dependencyLensSource: { attributeTypes: { nodes: {}, edges: attributeTypes.edges } }
                }
            })
        )
    })
})
