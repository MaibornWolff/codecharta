import { TestBed } from "@angular/core/testing"
import { BehaviorSubject } from "rxjs"
import { EXPLORER_CONDITIONAL_MODES } from "../sidebarExplorer/facade"
import { provideClustersExplorerMode } from "./provideClustersExplorerMode"
import { ClusterExplorerReadStore } from "./stores/clusterExplorer.read.store"

describe("provideClustersExplorerMode", () => {
    it("should offer the mode only while the loaded files carry clusters", () => {
        // Arrange
        const hasClusterings$ = new BehaviorSubject(false)
        TestBed.configureTestingModule({
            providers: [provideClustersExplorerMode(), { provide: ClusterExplorerReadStore, useValue: { hasClusterings$ } }]
        })
        const modes = TestBed.inject(EXPLORER_CONDITIONAL_MODES)

        // Act
        const withoutClusters = modes()
        hasClusterings$.next(true)
        const withClusters = modes()

        // Assert
        expect(withoutClusters).toEqual([])
        expect(withClusters.map(mode => mode.id)).toEqual(["clusters"])
        expect(withClusters[0].hidesListTools).toBe(true)
    })
})
