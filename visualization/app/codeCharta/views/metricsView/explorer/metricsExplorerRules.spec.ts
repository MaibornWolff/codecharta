import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { Store, StoreModule } from "@ngrx/store"
import { firstValueFrom } from "rxjs"
import { AddExcludedNodesIfNotResultsInEmptyMapEffect } from "../../../features/shared/effects/addExcludedNodesIfNotResultsInEmptyMap/addExcludedNodesIfNotResultsInEmptyMap.effect"
import { CcState, NodeRule } from "../../../model/codeCharta.model"
import { appReducers, setStateMiddleware } from "../../../stores/rootStore/store"
import { excludedNodesSelector, flattenedNodesSelector, metricRulesSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { addFlattenedNodes, addMetricRule, setSearchPattern } from "../../../stores/sharedView/sharedView.write.facade"
import { resultsInEmptyMap } from "../../../util/nodeRules/resultsInEmptyMap"
import { RuleFromSearchPatternEffect } from "../effects/ruleFromSearchPattern/ruleFromSearchPattern.effect"
import { MetricsExplorerRules } from "./metricsExplorerRules"

jest.mock("../../../util/nodeRules/resultsInEmptyMap", () => ({
    resultsInEmptyMap: jest.fn()
}))

const rulesOfEffect = async (effect: "flatten" | "exclude") =>
    firstValueFrom(TestBed.inject<Store<CcState>>(Store).select(effect === "flatten" ? flattenedNodesSelector : excludedNodesSelector))

describe("MetricsExplorerRules", () => {
    let rules: MetricsExplorerRules

    beforeEach(() => {
        jest.mocked(resultsInEmptyMap).mockImplementation(() => false)
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] }),
                EffectsModule.forRoot([RuleFromSearchPatternEffect, AddExcludedNodesIfNotResultsInEmptyMapEffect])
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
        expect(await rulesOfEffect("flatten")).toEqual([{ path: "*needle*" }])
    })

    it("should turn the map's search pattern into an exclude rule", async () => {
        // Act
        rules.ruleFromSearchPattern("exclude")

        // Assert
        expect(await rulesOfEffect("exclude")).toEqual([{ path: "*needle*" }])
    })

    it("should remove a rule from the map's blacklist", async () => {
        // Arrange
        const item: NodeRule = { path: "*needle*" }
        TestBed.inject(Store).dispatch(addFlattenedNodes({ items: [item] }))

        // Act
        rules.removeRule({ id: `flatten/${item.path}`, label: item.path, affectedCount: 1, kind: "RULE", item, effect: "flatten" })

        // Assert
        expect(await rulesOfEffect("flatten")).toEqual([])
    })

    it("should remove a metric rule from the map's rules", async () => {
        // Arrange
        const rule = { id: "rule-1", metric: "mcc" as const, operator: "gt" as const, value: 10, type: "flatten" as const }
        TestBed.inject(Store).dispatch(addMetricRule({ rule }))

        // Act
        rules.removeRule({ id: rule.id, label: "mcc > 10", affectedCount: 1, kind: "METRIC", metricRule: rule })

        // Assert
        expect(await firstValueFrom(TestBed.inject<Store<CcState>>(Store).select(metricRulesSelector))).toEqual([])
    })

    it("should report the pattern as unusable while the map's search is empty", async () => {
        // Arrange & Act
        TestBed.inject(Store).dispatch(setSearchPattern({ value: "" }))

        // Assert
        expect(await firstValueFrom(rules.isFlattenPatternDisabled$)).toBe(true)
        expect(await firstValueFrom(rules.isExcludePatternDisabled$)).toBe(true)
    })
})
