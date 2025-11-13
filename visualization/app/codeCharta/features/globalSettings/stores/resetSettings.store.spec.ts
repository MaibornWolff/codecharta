import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { ResetSettingsStore } from "./resetSettings.store"
import { setState } from "../../../state/store/state.actions"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { defaultState } from "../../../state/store/state.manager"

jest.mock("../../../ui/resetSettingsButton/getPartialDefaultState", () => ({
    getPartialDefaultState: jest.fn((settingsKeys: string[], _state) => {
        const partialState = {}
        for (const key of settingsKeys) {
            const keys = key.split(".")
            let pointer = partialState
            let defaultPointer = defaultState
            for (const [index, k] of keys.entries()) {
                if (index === keys.length - 1) {
                    pointer[k] = defaultPointer[k]
                } else {
                    if (!pointer[k]) {
                        pointer[k] = {}
                    }
                    pointer = pointer[k]
                    defaultPointer = defaultPointer[k]
                }
            }
        }
        return partialState
    })
}))

describe("ResetSettingsStore", () => {
    let store: ResetSettingsStore
    let mockStore: MockStore
    let mockState: jest.Mocked<Partial<State<any>>>

    beforeEach(() => {
        mockState = {
            getValue: jest.fn().mockReturnValue(defaultState)
        }

        TestBed.configureTestingModule({
            providers: [ResetSettingsStore, provideMockStore(), { provide: State, useValue: mockState }]
        })

        store = TestBed.inject(ResetSettingsStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("resetSettings", () => {
        it("should dispatch setState action with partial default state for single setting", async () => {
            // Arrange
            const settingsKeys = ["appSettings.isWhiteBackground"]

            // Act
            store.resetSettings(settingsKeys)

            // Assert
            const action: any = await getLastAction(mockStore)
            expect(action.type).toBe(setState.type)
            expect(action.value).toEqual({
                appSettings: {
                    isWhiteBackground: defaultState.appSettings.isWhiteBackground
                }
            })
        })

        it("should dispatch setState action with partial default state for multiple settings", async () => {
            // Arrange
            const settingsKeys = ["appSettings.hideFlatBuildings", "appSettings.experimentalFeaturesEnabled"]

            // Act
            store.resetSettings(settingsKeys)

            // Assert
            const action: any = await getLastAction(mockStore)
            expect(action.type).toBe(setState.type)
            expect(action.value).toEqual({
                appSettings: {
                    hideFlatBuildings: defaultState.appSettings.hideFlatBuildings,
                    experimentalFeaturesEnabled: defaultState.appSettings.experimentalFeaturesEnabled
                }
            })
        })

        it("should call State.getValue to get current state", () => {
            // Arrange
            const settingsKeys = ["appSettings.resetCameraIfNewFileIsLoaded"]

            // Act
            store.resetSettings(settingsKeys)

            // Assert
            expect(mockState.getValue).toHaveBeenCalled()
        })

        it("should handle empty settings keys array", async () => {
            // Arrange
            const settingsKeys: string[] = []

            // Act
            store.resetSettings(settingsKeys)

            // Assert
            const action: any = await getLastAction(mockStore)
            expect(action.type).toBe(setState.type)
            expect(action.value).toEqual({})
        })

        it("should reset layout algorithm setting", async () => {
            // Arrange
            const settingsKeys = ["appSettings.layoutAlgorithm"]

            // Act
            store.resetSettings(settingsKeys)

            // Assert
            const action: any = await getLastAction(mockStore)
            expect(action.type).toBe(setState.type)
            expect(action.value).toEqual({
                appSettings: {
                    layoutAlgorithm: defaultState.appSettings.layoutAlgorithm
                }
            })
        })

        it("should reset sharpness mode setting", async () => {
            // Arrange
            const settingsKeys = ["appSettings.sharpnessMode"]

            // Act
            store.resetSettings(settingsKeys)

            // Assert
            const action: any = await getLastAction(mockStore)
            expect(action.type).toBe(setState.type)
            expect(action.value).toEqual({
                appSettings: {
                    sharpnessMode: defaultState.appSettings.sharpnessMode
                }
            })
        })
    })
})
