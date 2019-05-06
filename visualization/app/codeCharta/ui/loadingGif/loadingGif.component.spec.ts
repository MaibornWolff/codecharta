import "./loadingGif.module"
import { LoadingGifController } from "./loadingGif.component"
import {getService, instantiateModule} from "../../../../mocks/ng.mockhelper"
import {IRootScopeService, ITimeoutService} from "angular";

describe("LoadingGifController", () => {

    let loadingGifController: LoadingGifController
    let $rootScope: IRootScopeService
    let $timeout: ITimeoutService

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.loadingGif")

        $rootScope = getService<IRootScopeService>("$rootScope")
        $timeout = getService<ITimeoutService>("$timeout")
    }

    function rebuildController() {
        loadingGifController = new LoadingGifController($rootScope, $timeout)
    }

    describe("constructor", () => {
        it("should subscribe to LoadingGifController", () => {
            LoadingGifController.subscribe = jest.fn()

            rebuildController()

            expect(LoadingGifController.subscribe).toHaveBeenCalledWith($rootScope, loadingGifController)
        })

        it("should set attribute isLoadingFile to true", () => {
            rebuildController()

            expect(loadingGifController["_viewModel"].isLoadingFile).toBeTruthy()
            expect(loadingGifController["_viewModel"].isLoadingMap).toBeTruthy()
        })
    })

    describe("onLoadingFileStatusChanged", () => {
        it("should set isLoadingFile in viewModel", () => {
            loadingGifController.onLoadingFileStatusChanged(true, undefined)

            expect(loadingGifController["_viewModel"].isLoadingFile).toBe(true)
        })

        it("should set isLoadingFile in viewModel", () => {
            loadingGifController.onLoadingFileStatusChanged(false, undefined)

            expect(loadingGifController["_viewModel"].isLoadingFile).toBe(false)
        })
    })

    describe("onLoadingMapStatusChanged", () => {
        it("should set isLoadingMap in viewModel", () => {
            loadingGifController.onLoadingMapStatusChanged(true, undefined)

            expect(loadingGifController["_viewModel"].isLoadingMap).toBe(true)
        })

        it("should set isLoadingMap in viewModel", () => {
            loadingGifController.onLoadingMapStatusChanged(false, undefined)

            expect(loadingGifController["_viewModel"].isLoadingMap).toBe(false)
        })
    })

});