import { setIsLoadingMap } from "./isLoadingMap.actions"
import { isLoadingMap } from "./isLoadingMap.reducer"

describe("isLoadingMap", () => {
    it("should set new isLoadingMap", () => {
        const result = isLoadingMap(true, setIsLoadingMap({ value: false }))

        expect(result).toBe(false)
    })
})
