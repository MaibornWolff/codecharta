import { TestBed } from "@angular/core/testing"
import { Store, StoreModule } from "@ngrx/store"
import { firstValueFrom } from "rxjs"
import { FILE_STATES } from "../../../mocks/dataMocks"
import { CcState } from "../../../model/codeCharta.model"
import { setFiles } from "../../../stores/fileStore/store/files.actions"
import { appReducers } from "../../../stores/rootStore/store"
import { edgeMetricDataSelector, edgeMetricNamesSelector, nodeEdgeMetricsMapSelector } from "./edgeMetricData.selector"

describe("edgeMetricData selectors", () => {
    let store: Store<CcState>

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers)]
        })
        store = TestBed.inject(Store)
        store.dispatch(setFiles({ value: FILE_STATES }))
    })

    afterEach(() => {
        edgeMetricDataSelector.release()
        nodeEdgeMetricsMapSelector.release()
        edgeMetricNamesSelector.release()
        TestBed.resetTestingModule()
    })

    it("should expose the edge metric data sorted by name", async () => {
        const edgeMetricData = await firstValueFrom(store.select(edgeMetricDataSelector))

        const names = edgeMetricData.map(metric => metric.name)
        expect(names).toEqual(["avgCommits", "otherMetric", "pairingRate"])
    })

    it("should expose edge metric names matching the edge metric data", async () => {
        const [edgeMetricData, edgeMetricNames] = await Promise.all([
            firstValueFrom(store.select(edgeMetricDataSelector)),
            firstValueFrom(store.select(edgeMetricNamesSelector))
        ])

        expect(edgeMetricNames).toEqual(edgeMetricData.map(metric => metric.name))
    })

    it("should expose the node edge metrics map keyed by metric name", async () => {
        const nodeEdgeMetricsMap = await firstValueFrom(store.select(nodeEdgeMetricsMapSelector))

        expect([...nodeEdgeMetricsMap.keys()]).toContain("pairingRate")
    })
})
