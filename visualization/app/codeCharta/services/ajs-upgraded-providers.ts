import { InjectionToken, Injector } from "@angular/core"

export const ThreeSceneServiceToken = new InjectionToken("ThreeSceneService")
export const threeSceneServiceProvider = {
	provide: ThreeSceneServiceToken,
	useFactory: function ThreeSceneServiceFactory(injector: Injector) {
		return injector.get("threeSceneService")
	},
	deps: ["$injector"]
}

export const CodeChartaServiceToken = new InjectionToken("CodeChartaService")
export const codeChartaServiceProvider = {
	provide: CodeChartaServiceToken,
	useFactory: function CodeChartaServiceFactory(injector: Injector) {
		return injector.get("codeChartaService")
	},
	deps: ["$injector"]
}

export const ThreeCameraServiceToken = new InjectionToken("ThreeCameraService")
export const threeCameraServiceProvider = {
	provide: ThreeCameraServiceToken,
	useFactory: function ThreeCameraServiceFactory(injector: Injector) {
		return injector.get("threeCameraService")
	},
	deps: ["$injector"]
}

export const ThreeOrbitControlsServiceToken = new InjectionToken("ThreeOrbitControlsService")
export const threeOrbitControlsServiceProvider = {
	provide: ThreeOrbitControlsServiceToken,
	useFactory: function ThreeOrbitControlsServiceFactory(injector: Injector) {
		return injector.get("threeOrbitControlsService")
	},
	deps: ["$injector"]
}

export const ThreeRendererServiceToken = new InjectionToken("ThreeRendererService")
export const threeRendererServiceProvider = {
	provide: ThreeRendererServiceToken,
	useFactory: function ThreeRendererServiceTokenFactory(injector: Injector) {
		return injector.get("threeRendererService")
	},
	deps: ["$injector"]
}
