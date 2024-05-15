import { FilterCustomConfigDataBySearchTermPipe } from "./filterCustomConfigDataBySearchTerm.pipe"
import { CustomConfigItem } from "../../../customConfigs.component"
import { CUSTOM_CONFIG_ITEM_GROUPS } from "../../../../../util/dataMocks"

describe("FilterCustomConfigDataBySearchTermPipe", () => {
    let pipe: FilterCustomConfigDataBySearchTermPipe
    let allCustomConfigItems: CustomConfigItem[]

    beforeEach(() => {
        pipe = new FilterCustomConfigDataBySearchTermPipe()
        allCustomConfigItems = [...CUSTOM_CONFIG_ITEM_GROUPS.values()].flatMap(group => group.customConfigItems)
    })

    it("should filter custom configurations by name", () => {
        const searchTerm = "samplemap view #1"
        const results = pipe.transform(allCustomConfigItems, searchTerm)
        expect(results.length).toBe(2)
        expect(results.every(item => item.name.toLocaleLowerCase().includes(searchTerm))).toBe(true)
    })

    it("should filter custom configurations by mapSelectionMode", () => {
        const searchTerm = "standard"
        const results = pipe.transform(allCustomConfigItems, searchTerm)
        expect(results.length).toBe(4)
        for (const item of results) {
            expect(item.mapSelectionMode.toLowerCase()).toContain(searchTerm)
        }
    })

    it("should filter custom configurations by metric names", () => {
        const searchTerm = "rloc"
        const results = pipe.transform(allCustomConfigItems, searchTerm)
        expect(results.length).toBe(5)
        for (const item of results) {
            const metricValues = Object.values(item.metrics).map(metric => metric?.toLowerCase())
            expect(metricValues.some(metric => metric?.includes(searchTerm))).toBe(true)
        }
    })
})
