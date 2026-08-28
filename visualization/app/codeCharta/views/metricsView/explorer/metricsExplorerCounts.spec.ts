import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { firstValueFrom } from "rxjs"
import { ExplorerCounts } from "../../../features/sidebarExplorer/facade"
import { defaultState } from "../../../stores/rootStore/state.manager"
import { explorerCountsSelector } from "./explorerCounts.selector"
import { MetricsExplorerCounts } from "./metricsExplorerCounts"

const COUNTS: ExplorerCounts = { shown: 3, flattened: 2, hidden: 1, noArea: 0 }

describe("MetricsExplorerCounts", () => {
    it("should report the map's explorer counts", async () => {
        // Arrange
        TestBed.configureTestingModule({
            providers: [
                provideMockStore({ initialState: defaultState, selectors: [{ selector: explorerCountsSelector, value: COUNTS }] }),
                MetricsExplorerCounts
            ]
        })

        // Act
        const counts = await firstValueFrom(TestBed.inject(MetricsExplorerCounts).counts$)

        // Assert
        expect(counts).toEqual(COUNTS)
    })
})
