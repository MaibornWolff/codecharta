import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { setEdgeMetric } from "../../../stores/mapState/mapState.write.facade"
import { setDependencyGraphSettings } from "../../../stores/preferences/preferences.write.facade"
import {
    addExcludedNodesIfNotResultsInEmptyMap,
    NodeInteraction,
    setRightClickedNodeData
} from "../../../stores/sharedView/sharedView.write.facade"
import { DependencyMapWriteStore } from "./dependencyMap.write.store"

describe("DependencyMapWriteStore", () => {
    let writeStore: DependencyMapWriteStore
    let nodeInteraction: { selectNode: jest.Mock; hoverNode: jest.Mock }
    let dispatchSpy: jest.SpyInstance

    beforeEach(() => {
        nodeInteraction = { selectNode: jest.fn(), hoverNode: jest.fn() }
        TestBed.configureTestingModule({ providers: [provideMockStore(), { provide: NodeInteraction, useValue: nodeInteraction }] })
        dispatchSpy = jest.spyOn(TestBed.inject(MockStore), "dispatch")
        writeStore = TestBed.inject(DependencyMapWriteStore)
    })

    it("should select and hover through the shared node interaction", () => {
        // Act
        writeStore.selectNode("/root/a.ts")
        writeStore.hoverNode(null)

        // Assert
        expect(nodeInteraction.selectNode).toHaveBeenCalledWith("/root/a.ts")
        expect(nodeInteraction.hoverNode).toHaveBeenCalledWith(null)
    })

    it("should open the node context menu at the pointer, naming the dependency map as its origin", () => {
        // Act
        writeStore.openContextMenu("/root/a.ts", 10, 20)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(
            setRightClickedNodeData({
                value: { nodeId: "/root/a.ts", xPositionOfRightClickEvent: 10, yPositionOfRightClickEvent: 20, origin: "dependencyMap" }
            })
        )
    })

    it("should exclude a node through the guard that keeps the map from going empty", () => {
        // Act
        writeStore.excludeNode("/root/training")

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(addExcludedNodesIfNotResultsInEmptyMap({ items: [{ path: "/root/training" }] }))
    })

    it("should set the edge metric the Metric view shares", () => {
        // Act
        writeStore.setEdgeMetric("temporal_coupling")

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setEdgeMetric({ value: "temporal_coupling" }))
    })

    it("should change the bar's settings that are kept across reloads", () => {
        // Act
        writeStore.changeSettings({ edgeStyle: "straight" })

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setDependencyGraphSettings({ value: { edgeStyle: "straight" } }))
    })
})
