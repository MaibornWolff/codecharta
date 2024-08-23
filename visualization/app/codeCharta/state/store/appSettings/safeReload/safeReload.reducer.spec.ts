import { safeReload } from "./safeReload.reducer"
import { setSafeReload } from "./safeReload.actions"

describe("safeReload", () => {
    it("should set new safeReload", () => {
        const result = safeReload(false, setSafeReload({ value: true }))

        expect(result).toBeTruthy()
    })
})
