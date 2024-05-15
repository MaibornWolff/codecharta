import { hideFlatBuildings } from "./hideFlatBuildings.reducer"
import { setHideFlatBuildings } from "./hideFlatBuildings.actions"

describe("hideFlatBuildings", () => {
    it("should set new hideFlatBuildings", () => {
        const result = hideFlatBuildings(false, setHideFlatBuildings({ value: true }))

        expect(result).toBeTruthy()
    })
})
