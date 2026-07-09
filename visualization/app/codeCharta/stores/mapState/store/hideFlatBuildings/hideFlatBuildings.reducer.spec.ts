import { setHideFlatBuildings } from "./hideFlatBuildings.actions"
import { hideFlatBuildings } from "./hideFlatBuildings.reducer"

describe("hideFlatBuildings", () => {
    it("should set new hideFlatBuildings", () => {
        const result = hideFlatBuildings(false, setHideFlatBuildings({ value: true }))

        expect(result).toBeTruthy()
    })
})
