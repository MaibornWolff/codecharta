import { InjectionToken, Injector } from "@angular/core"

export const ThreeSceneServiceToken = new InjectionToken("ThreeSceneService")

export function ThreeSceneServiceFactory(injector: Injector) {
	return injector.get("threeSceneService")
}

export const threeSceneServiceProvider = {
	provide: ThreeSceneServiceToken,
	useFactory: ThreeSceneServiceFactory,
	deps: ["$injector"]
}
