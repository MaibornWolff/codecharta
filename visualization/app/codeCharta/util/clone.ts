import rfdc from "rfdc"

export function clone(content: any): any {
	return rfdc()(content)
}
