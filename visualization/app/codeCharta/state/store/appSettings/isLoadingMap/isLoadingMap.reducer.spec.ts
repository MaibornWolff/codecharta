import { isLoadingMap } from "./isLoadingMap.reducer"
import { setIsLoadingMap } from "./isLoadingMap.actions"

describe("isLoadingMap", () => {
	it("should set new isLoadingMap", () => {
		const result = isLoadingMap(true, setIsLoadingMap({ value: false }))

		expect(result).toBe(false)
	})
})
