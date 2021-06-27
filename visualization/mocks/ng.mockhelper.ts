import angular, { IAngularStatic } from "angular"
import "angular-mocks"
import ngRedux from "ng-redux"
import { Store } from "../app/codeCharta/state/store/store"

export const NGMock: IAngularStatic = angular
export const NG = angular

export function instantiateModule(id: string) {
	NGMock.mock.module(id)
}

export function instantiateModuleWithNgRedux(id: string) {
	Store["_store"] = undefined // reset store
	const testNgReduxProvider = "testNgReduxProvider"

	if (!isModuleLoaded(testNgReduxProvider)) {
		angular.module(testNgReduxProvider, [ngRedux]).config([
			"$ngReduxProvider",
			$ngReduxProvider => {
				$ngReduxProvider.provideStore(Store.store)
			}
		])
	}

	NGMock.mock.module(testNgReduxProvider)
	NGMock.mock.module(id)

	return getService<ngRedux.INgRedux>("$ngRedux")
}

export function getService<T>(id: string): T {
	// eslint-disable-next-line prefer-const
	let service: T = null
	eval(`NGMock.mock.inject(function(_${id}_) { service = _${id}_; });`)
	return service
}

function isModuleLoaded(id: string): boolean {
	try {
		angular.module(id)
		return true
	} catch (e) {
		if (/No module/.test(e) || e.message.indexOf("$injector:nomod") > -1) {
			return false
		}

		console.error(e)
	}

	return false
}
