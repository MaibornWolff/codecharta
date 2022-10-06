import angular, { IAngularStatic } from "angular"
import { IdToBuildingService } from "../app/codeCharta/services/idToBuilding/idToBuilding.service"
import { Store } from "../app/codeCharta/state/store/store"

export const NGMock: IAngularStatic = angular

export function instantiateModule(id: string) {
	NGMock.mock.module(id)
	const idToBuildingService = new IdToBuildingService()
	angular.mock.module(($provide: ng.auto.IProvideService) => {
		$provide.value("idToBuilding", idToBuildingService)
	})
	angular.mock.module(($provide: ng.auto.IProvideService) => {
		$provide.value("viewCubeMouseEvents", {})
	})
	angular.mock.module(($provide: ng.auto.IProvideService) => {
		$provide.value("threeRendererService", { render: jest.fn() })
	})
	angular.mock.module(($provide: ng.auto.IProvideService) => {
		$provide.value("threeStatsService", {})
	})
	angular.mock.module(($provide: ng.auto.IProvideService) => {
		$provide.value("threeCameraService", {})
	})
	angular.mock.module(($provide: ng.auto.IProvideService) => {
		$provide.value("threeSceneService", { subscribe: jest.fn() })
	})
}

export function getService<T>(id: string): T {
	// eslint-disable-next-line prefer-const
	let service: T = null
	eval(`NGMock.mock.inject(function(_${id}_) { service = _${id}_; });`)
	if (id === "storeService") {
		// reset shared store
		Store["initialize"]()
	}
	return service
}

export { default as NG } from "angular"
