import "./threeViewer.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../state/store.service"
import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { IsWhiteBackgroundService } from "../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.service"
import { ThreeRendererService } from "./threeRendererService"
import { ThreeCameraService } from "./threeCameraService"
import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three"
import { ThreeSceneService } from "./threeSceneService"
import { CustomComposer } from "../rendering/postprocessor/customComposer"

describe("ThreeRenderService", () => {
    let threeRendererService: ThreeRendererService
    let storeService: StoreService
    let $rootScope: IRootScopeService
    let threeCameraService: ThreeCameraService
    let threeSceneService: ThreeSceneService

	beforeEach(() => {
        restartSystem()
        rebuildService()
	})

	const restartSystem = () => {
        instantiateModule("app.codeCharta.ui.codeMap.threeViewer")

        $rootScope = getService<IRootScopeService>("$rootScope")
        storeService = getService<StoreService>("storeService")
        threeCameraService = getService<ThreeCameraService>("threeCameraService")
        threeSceneService = getService<ThreeSceneService>("threeSceneService")
    }

    const rebuildService = () => {
		threeRendererService = new ThreeRendererService(storeService, $rootScope)
    }
    
    const mockThreeJs = () => {
        threeCameraService = getService<ThreeCameraService>("threeCameraService")
        threeCameraService.camera = new PerspectiveCamera()
        threeSceneService.scene = { position: new Vector3(1, 2, 3) } as Scene
        threeRendererService.composer = { render: jest.fn() } as unknown as CustomComposer
        threeRendererService.renderer = { render: jest.fn() } as unknown as WebGLRenderer
    }

    describe("constructor", () => {
		it("should subscribe to IsWhiteBackgroundService", () => {
			IsWhiteBackgroundService.subscribe = jest.fn()

			rebuildService()

			expect(IsWhiteBackgroundService.subscribe).toHaveBeenCalledWith($rootScope, threeRendererService)
		})
    })

	describe("render", () => {
        beforeEach(() => {
			mockThreeJs()
        })

        const setFXAA = (value : boolean) => {
            threeRendererService.enableFXAA = value
        }
        
		it("should call composer when FXAA is enabled", () => {
            setFXAA(true)
            threeRendererService.render()
            
            expect(threeRendererService.composer.render).toHaveBeenCalled()
        })

        it("should call normal renderer when FXAA is disabled", () => {
            setFXAA(false)
            const { scene = threeSceneService.scene, camera = threeCameraService.camera} = threeRendererService
            
            threeRendererService.render()
            
            expect(threeRendererService.renderer.render).toHaveBeenCalledWith(scene,camera)
        })
	})
})
