import { klona } from "klona/json"

export function clone<T>(content: T): T {
	return klona(content)
}
