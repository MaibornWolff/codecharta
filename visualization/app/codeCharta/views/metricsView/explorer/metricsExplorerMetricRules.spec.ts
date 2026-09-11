import { TestBed } from "@angular/core/testing"
import { Store, StoreModule } from "@ngrx/store"
import { firstValueFrom } from "rxjs"
import { CcState } from "../../../model/codeCharta.model"
import { appReducers, setStateMiddleware } from "../../../stores/rootStore/store"
import { metricRulesSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { MetricsExplorerMetricRules } from "./metricsExplorerMetricRules"

const storedRules = async () => firstValueFrom(TestBed.inject<Store<CcState>>(Store).select(metricRulesSelector))

describe("MetricsExplorerMetricRules", () => {
    let metricRules: MetricsExplorerMetricRules

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })],
            providers: [MetricsExplorerMetricRules]
        })
        metricRules = TestBed.inject(MetricsExplorerMetricRules)
    })

    it("should store an added rule", async () => {
        // Act
        metricRules.addRule({ metric: "mcc", operator: "gt", value: 10, type: "flatten" })

        // Assert
        expect(await storedRules()).toEqual([expect.objectContaining({ metric: "mcc", operator: "gt", value: 10, type: "flatten" })])
    })

    it("should give every rule its own id, so two identical conditions stay two rules", async () => {
        // Act
        metricRules.addRule({ metric: "mcc", operator: "gt", value: 10, type: "flatten" })
        metricRules.addRule({ metric: "mcc", operator: "gt", value: 10, type: "exclude" })

        // Assert
        const rules = await storedRules()
        expect(rules).toHaveLength(2)
        expect(rules[0].id).not.toBe(rules[1].id)
    })

    it("should expose no metric values while no map is loaded", async () => {
        // Act
        const values = await firstValueFrom(metricRules.metricValues$)

        // Assert
        expect(values.size).toBe(0)
    })

    it("should expose no metric descriptors while no map is loaded", async () => {
        // Act
        const descriptors = await firstValueFrom(metricRules.descriptors$)

        // Assert
        expect(descriptors).toEqual({})
    })
})
