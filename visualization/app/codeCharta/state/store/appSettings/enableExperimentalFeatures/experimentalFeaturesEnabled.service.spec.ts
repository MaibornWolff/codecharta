import "../../../state.module"
import {IRootScopeService} from "angular"
import {StoreService} from "../../../store.service"
import {getService, instantiateModule} from "../../../../../../mocks/ng.mockhelper"
import {
    ExperimentalFeaturesEnabledAction,
    ExperimentalFeaturesEnabledActions
} from "./experimentalFeaturesEnabled.actions"
import {ExperimentalFeaturesEnabledService} from "./experimentalFeaturesEnabled.service"
import {withMockedEventMethods} from "../../../../util/dataMocks"

describe("ExperimentalFeaturesEnabledService", () => {
    let experimentalFeaturesEnabledService: ExperimentalFeaturesEnabledService
    let storeService: StoreService
    let $rootScope: IRootScopeService

    beforeEach(() => {
        restartSystem()
        rebuildService()
        withMockedEventMethods($rootScope)
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.state")

        $rootScope = getService<IRootScopeService>("$rootScope")
        storeService = getService<StoreService>("storeService")
    }

    function rebuildService() {
        experimentalFeaturesEnabledService = new ExperimentalFeaturesEnabledService($rootScope, storeService)
    }

    describe("constructor", () => {
        it("should subscribe to store", () => {
            StoreService.subscribe = jest.fn()

            rebuildService()

            expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, experimentalFeaturesEnabledService)
        })
    })

    describe("onStoreChanged", () => {
        it("should notify all subscribers with the new experimentalFeaturesEnabled value", () => {
            const action: ExperimentalFeaturesEnabledAction = {
                type: ExperimentalFeaturesEnabledActions.SET_EXPERIMENTAL_FEATURES_ENABLED,
                payload: true
            }
            storeService["store"].dispatch(action)

            experimentalFeaturesEnabledService.onStoreChanged(ExperimentalFeaturesEnabledActions.SET_EXPERIMENTAL_FEATURES_ENABLED)

            expect($rootScope.$broadcast).toHaveBeenCalledWith(
                "experimental-features-enabled-changed",
                {experimentalFeaturesEnabled: true}
            )
        })

        it("should not notify anything on non-experimental-features-enabled-events", () => {
            experimentalFeaturesEnabledService.onStoreChanged("ANOTHER_ACTION")

            expect($rootScope.$broadcast).not.toHaveBeenCalled()
        })
    })
})
