import angular, { IAngularStatic } from "angular"
import "angular-mocks"

export const NGMock: IAngularStatic = angular
export const NG = angular

export function instantiateModule(id: string) {
	NGMock.mock.module(id)
}

export function getService<T>(id: string): T {
	// eslint-disable-next-line prefer-const
	let service: T = null
	eval(`NGMock.mock.inject(function(_${id}_) { service = _${id}_; });`)
	return service
}
