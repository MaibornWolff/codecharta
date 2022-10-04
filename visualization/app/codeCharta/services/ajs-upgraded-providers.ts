import { InjectionToken, Injector } from "@angular/core"

export const CodeChartaServiceToken = new InjectionToken("CodeChartaService")
export const codeChartaServiceProvider = {
	provide: CodeChartaServiceToken,
	useFactory: function CodeChartaServiceFactory(injector: Injector) {
		return injector.get("codeChartaService")
	},
	deps: ["$injector"]
}

export const ThreeViewerServiceToken = new InjectionToken("ThreeViewerService")
export const threeViewerServiceTokenProvider = {
	provide: ThreeViewerServiceToken,
	useFactory: function ThreeViewerServiceTokenFactory(injector: Injector) {
		return injector.get("threeViewerService")
	},
	deps: ["$injector"]
}

export const CodeMapMouseEventServiceToken = new InjectionToken("CodeMapMouseEventService")
export const CodeMapMouseEventServiceTokenProvider = {
	provide: CodeMapMouseEventServiceToken,
	useFactory: function CodeMapMouseEventServiceTokenFactory(injector: Injector) {
		return injector.get("codeMapMouseEventService")
	},
	deps: ["$injector"]
}
