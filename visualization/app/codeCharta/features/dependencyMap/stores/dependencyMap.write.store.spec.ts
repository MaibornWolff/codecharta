import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { setEdgeMetric } from "../../../stores/mapState/mapState.write.facade"
import { setDependencyGraphSettings } from "../../../stores/preferences/preferences.write.facade"
import { NodeInteraction, setRightClickedNodeData, unfocusNode } from "../../../stores/sharedView/sharedView.write.facade"
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
        // Arrange
        const path = "/root/a.ts"

        // Act
        writeStore.selectNode(path)
        writeStore.hoverNode(null)

        // Assert
        expect(nodeInteraction.selectNode).toHaveBeenCalledWith(path)
        expect(nodeInteraction.hoverNode).toHaveBeenCalledWith(null)
    })

    it("should open the node context menu at the pointer, naming the dependency map as its origin", () => {
        // Arrange
        const pointer = { clientX: 10, clientY: 20 }

        // Act
        writeStore.openContextMenu("/root/a.ts", pointer.clientX, pointer.clientY)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(
            setRightClickedNodeData({
                value: {
                    nodeId: "/root/a.ts",
                    xPositionOfRightClickEvent: pointer.clientX,
                    yPositionOfRightClickEvent: pointer.clientY,
                    origin: "dependencyMap"
                }
            })
        )
    })

    it("should set the edge metric the Metric view shares", () => {
        // Arrange
        const edgeMetric = "temporal_coupling"

        // Act
        writeStore.setEdgeMetric(edgeMetric)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setEdgeMetric({ value: edgeMetric }))
    })

    it("should change the bar's settings that are kept across reloads", () => {
        // Arrange
        const settings = { edgeStyle: "straight" as const }

        // Act
        writeStore.changeSettings(settings)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setDependencyGraphSettings({ value: settings }))
    })

    it("should unfocus the node the Metric view focused", () => {
        // Arrange
        const unfocusAction = unfocusNode()

        // Act
        writeStore.unfocus()

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(unfocusAction)
    })
})
