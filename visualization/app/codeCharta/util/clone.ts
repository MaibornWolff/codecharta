import rfdc from "rfdc"

export function clone<T>(content: T): T {
	return rfdc()(content)
}
