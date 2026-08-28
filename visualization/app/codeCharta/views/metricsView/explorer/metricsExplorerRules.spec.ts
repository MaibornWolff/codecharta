import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { Store, StoreModule } from "@ngrx/store"
import { firstValueFrom } from "rxjs"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "../../../features/shared/effects/addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"
import { BlacklistItem, CcState } from "../../../model/codeCharta.model"
import { appReducers, setStateMiddleware } from "../../../stores/rootStore/store"
import { blacklistSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { addBlacklistItems, setSearchPattern } from "../../../stores/sharedView/sharedView.write.facade"
import { resultsInEmptyMap } from "../../../util/blacklist/resultsInEmptyMap"
import { BlacklistSearchPatternEffect } from "../effects/blacklistSearchPattern/blacklistSearchPattern.effect"
import { MetricsExplorerRules } from "./metricsExplorerRules"

jest.mock("../../../util/blacklist/resultsInEmptyMap", () => ({
    resultsInEmptyMap: jest.fn()
}))

const blacklistOfType = async (type: "flatten" | "exclude") =>
    (await firstValueFrom(TestBed.inject<Store<CcState>>(Store).select(blacklistSelector))).filter(item => item.type === type)

describe("MetricsExplorerRules", () => {
    let rules: MetricsExplorerRules

    beforeEach(() => {
        jest.mocked(resultsInEmptyMap).mockImplementation(() => false)
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] }),
                EffectsModule.forRoot([BlacklistSearchPatternEffect, AddBlacklistItemsIfNotResultsInEmptyMapEffect])
            ],
            providers: [MetricsExplorerRules]
        })
        rules = TestBed.inject(MetricsExplorerRules)
        TestBed.inject(Store).dispatch(setSearchPattern({ value: "needle" }))
    })

    it("should turn the map's search pattern into a flatten rule", async () => {
        // Act
        rules.ruleFromSearchPattern("flatten")

        // Assert
        expect(await blacklistOfType("flatten")).toEqual([{ path: "*needle*", type: "flatten" }])
    })

    it("should turn the map's search pattern into an exclude rule", async () => {
        // Act
        rules.ruleFromSearchPattern("exclude")

        // Assert
        expect(await blacklistOfType("exclude")).toEqual([{ path: "*needle*", type: "exclude" }])
    })

    it("should remove a rule from the map's blacklist", async () => {
        // Arrange
        const item: BlacklistItem = { type: "flatten", path: "*needle*" }
        TestBed.inject(Store).dispatch(addBlacklistItems({ items: [item] }))

        // Act
        rules.removeRule(item)

        // Assert
        expect(await blacklistOfType("flatten")).toEqual([])
    })

    it("should report the pattern as unusable while the map's search is empty", async () => {
        // Arrange & Act
        TestBed.inject(Store).dispatch(setSearchPattern({ value: "" }))

        // Assert
        expect(await firstValueFrom(rules.isFlattenPatternDisabled$)).toBe(true)
        expect(await firstValueFrom(rules.isExcludePatternDisabled$)).toBe(true)
    })
})
