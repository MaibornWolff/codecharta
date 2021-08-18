import angular, { IAngularStatic } from "angular"
import { Store } from "../app/codeCharta/state/store/store"

export const NGMock: IAngularStatic = angular
export const NG = angular

export function instantiateModule(id: string) {
	NGMock.mock.module(id)
}

export function getService<T>(id: string): T {
	// eslint-disable-next-line prefer-const
	let service: T = null
	eval(`NGMock.mock.inject(function(_${id}_) { service = _${id}_; });`)
	if (id === "storeService") Store["initialize"]() // reset shared store
	return service
}
