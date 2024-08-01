import { downloadAndCollectPurgeableConfigs } from "./downloadAndCollectPurgeableConfigs"
import { CustomConfigHelper } from "../../../../../util/customConfigHelper"
import { CustomConfig } from "../../../../../model/customConfig/customConfig.api.model"

jest.mock("../../../../../util/customConfigHelper")

describe("downloadAndCollectPurgeableConfigs", () => {
    const MOCK_DATE_NOW = Date.UTC(2015, 1, 15, 12, 0, 0, 0) // Months are 0-indexed, so 1 = Feb
    const customConfigAgeLimitInMonths = 6
    const millisecondsPerMonth = 1000 * 60 * 60 * 24 * 30

    beforeEach(() => {
        jest.spyOn(Date, "now").mockReturnValue(MOCK_DATE_NOW)
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    afterAll(() => {
        jest.restoreAllMocks()
    })

    test("should download and collect configurations older than the specified limit", () => {
        const oldConfigTime = MOCK_DATE_NOW - (customConfigAgeLimitInMonths + 1) * millisecondsPerMonth
        const recentConfigTime = MOCK_DATE_NOW - (customConfigAgeLimitInMonths - 1) * millisecondsPerMonth

        const customConfigs = new Map()
        customConfigs.set("oldConfig", { creationTime: oldConfigTime })
        customConfigs.set("recentConfig", { creationTime: recentConfigTime })

        const mockExportedConfig = {
            ...customConfigs.get("oldConfig")
        }

        jest.spyOn(CustomConfigHelper, "getCustomConfigs").mockReturnValue(customConfigs)
        jest.spyOn(CustomConfigHelper, "createExportCustomConfigFromConfig").mockReturnValue(mockExportedConfig as CustomConfig)

        const purgeableConfigs = downloadAndCollectPurgeableConfigs()

        expect(purgeableConfigs.size).toBe(1)
        expect(purgeableConfigs.has(customConfigs.get("oldConfig"))).toBe(true)

        expect(CustomConfigHelper.createExportCustomConfigFromConfig).toHaveBeenCalledTimes(1)
        expect(CustomConfigHelper.createExportCustomConfigFromConfig).toHaveBeenCalledWith(customConfigs.get("oldConfig"))

        expect(CustomConfigHelper.downloadCustomConfigs).toHaveBeenCalledTimes(1)
        expect(CustomConfigHelper.downloadCustomConfigs).toHaveBeenCalledWith(new Map([["oldConfig", mockExportedConfig]]))
    })

    test("should handle configurations without a creationTime property", () => {
        const customConfigs = new Map()
        customConfigs.set("newConfig", {})

        jest.spyOn(CustomConfigHelper, "getCustomConfigs").mockReturnValue(customConfigs)

        const purgeableConfigs = downloadAndCollectPurgeableConfigs()

        expect(purgeableConfigs.size).toBe(0)

        expect(CustomConfigHelper.createExportCustomConfigFromConfig).not.toHaveBeenCalled()
        expect(CustomConfigHelper.downloadCustomConfigs).not.toHaveBeenCalled()
    })

    test("should return an empty set if no configurations are purgeable", () => {
        const recentConfigTime = MOCK_DATE_NOW - (customConfigAgeLimitInMonths - 1) * millisecondsPerMonth

        const customConfigs = new Map()
        customConfigs.set("recentConfig", { creationTime: recentConfigTime })

        jest.spyOn(CustomConfigHelper, "getCustomConfigs").mockReturnValue(customConfigs)

        const purgeableConfigs = downloadAndCollectPurgeableConfigs()

        expect(purgeableConfigs.size).toBe(0)
        expect(CustomConfigHelper.downloadCustomConfigs).not.toHaveBeenCalled()
    })
})
