import { InjectionToken, Injector } from "@angular/core"

export const CodeChartaServiceToken = new InjectionToken("CodeChartaService")
export const codeChartaServiceProvider = {
	provide: CodeChartaServiceToken,
	useFactory: function CodeChartaServiceFactory(injector: Injector) {
		return injector.get("codeChartaService")
	},
	deps: ["$injector"]
}
