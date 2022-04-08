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
