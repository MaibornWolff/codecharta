import { TestBed } from "@angular/core/testing"
import { LabelCollisionService } from "./labelCollision.service"
import { LabelCreationService } from "./labelCreation.service"
import { CcState, Node } from "../../../codeCharta.model"
import { Group, BoxGeometry, Mesh, Scene } from "three"
import { ThreeSceneService } from "../../../ui/codeMap/threeViewer/threeSceneService"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import { CodeMapTooltipService } from "../../../ui/codeMap/codeMap.tooltip.service"
import { setShowMetricLabelNodeName } from "../../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { Store, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"
import { StateAccessStore } from "../stores/stateAccess.store"
import { setHeightMetric } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"

describe("LabelCollisionService", () => {
    let store: Store<CcState>
    let stateAccessStore: StateAccessStore
    let threeSceneService: ThreeSceneService
    let threeRendererService: ThreeRendererService
    let tooltipService: Partial<CodeMapTooltipService>
    let labelCreationService: LabelCreationService
    let labelCollisionService: LabelCollisionService
    let sampleLeaf: Node
    let otherSampleLeaf: Node

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        store = TestBed.inject(Store)
        stateAccessStore = TestBed.inject(StateAccessStore)
        threeSceneService = TestBed.inject(ThreeSceneService)
        threeRendererService = TestBed.inject(ThreeRendererService)
        tooltipService = {
            getRect: jest.fn().mockReturnValue(null),
            isVisible: jest.fn().mockReturnValue(false)
        }

        threeSceneService.mapGeometry = new Group().add(new Mesh(new BoxGeometry(10, 10, 10)))
        threeSceneService.labels = new Group()
        threeSceneService.scene = new Scene()

        labelCreationService = new LabelCreationService(stateAccessStore, threeSceneService)
        labelCollisionService = new LabelCollisionService(
            threeRendererService,
            threeSceneService,
            tooltipService as CodeMapTooltipService,
            labelCreationService,
            stateAccessStore
        )

        sampleLeaf = {
            name: "sample",
            path: "/root/sample",
            width: 1,
            height: 2,
            length: 3,
            depth: 4,
            x0: 5,
            z0: 6,
            y0: 7,
            isLeaf: true,
            deltas: { a: 1, b: 2 },
            attributes: { a: 20, b: 15, mcc: 99 },
            children: []
        } as undefined as Node

        otherSampleLeaf = {
            name: "otherSampleLeaf",
            path: "/root/otherSampleLeaf",
            width: 4,
            height: 3,
            length: 2,
            depth: 1,
            x0: 5,
            z0: 6,
            y0: 7,
            isLeaf: true,
            deltas: { a: 1, b: 2 },
            attributes: { a: 20, b: 15, mcc: 99 },
            children: []
        } as undefined as Node
    })

    function makeRect(top: number, bottom: number, left: number, right: number): DOMRect {
        return {
            top,
            bottom,
            left,
            right,
            width: right - left,
            height: bottom - top,
            x: left,
            y: top,
            toJSON: () => {}
        } as DOMRect
    }

    function stubRectsForLabels(rects: DOMRect[]) {
        const labels = labelCreationService.getLabels()
        for (let i = 0; i < rects.length; i++) {
            const content = labels[i].labelElement.getContentElement()
            jest.spyOn(content, "getBoundingClientRect").mockReturnValue(rects[i])
        }
    }

    describe("updateLabelLayout", () => {
        it("should be a no-op for zero labels", () => {
            // Act & Assert
            labelCollisionService.updateLabelLayout()
            expect(labelCreationService.getLabels().length).toBe(0)
        })

        it("should process a single label without collision avoidance", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            labelCreationService.addLeafLabel(sampleLeaf, 0)

            // Act
            labelCollisionService.updateLabelLayout()

            // Assert
            expect(labelCreationService.getLabels().length).toBe(1)
        })

        it("should apply transform styles to label content when processing labels", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            labelCreationService.addLeafLabel(sampleLeaf, 0)
            labelCreationService.addLeafLabel(otherSampleLeaf, 0)
            const content0 = labelCreationService.getLabels()[0].labelElement.getContentElement()
            const content1 = labelCreationService.getLabels()[1].labelElement.getContentElement()

            // Act
            labelCollisionService.updateLabelLayout()

            // Assert
            expect(content0.style.transform).toContain("translateY")
            expect(content1.style.transform).toContain("translateY")
        })
    })

    describe("collision grouping", () => {
        beforeEach(() => {
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            store.dispatch(setHeightMetric({ value: "mcc" }))
        })

        it("should set transform style on each label content element during layout", () => {
            // Arrange
            labelCreationService.addLeafLabel(sampleLeaf, 0)
            const content = labelCreationService.getLabels()[0].labelElement.getContentElement()
            jest.spyOn(content, "getBoundingClientRect").mockReturnValue(makeRect(100, 120, 50, 150))

            // Act
            labelCollisionService.updateLabelLayout()

            // Assert
            expect(content.style.transform).toBe("translateY(-20px)")
        })

        it("should hide the lower-priority label when two labels overlap", () => {
            // Arrange
            const highLeaf = { ...sampleLeaf, name: "high", path: "/root/high", attributes: { mcc: 100 } } as undefined as Node
            const lowLeaf = { ...otherSampleLeaf, name: "low", path: "/root/low", attributes: { mcc: 10 } } as undefined as Node
            labelCreationService.addLeafLabel(highLeaf, 0)
            labelCreationService.addLeafLabel(lowLeaf, 0)
            const sharedRect = makeRect(100, 120, 50, 150)
            stubRectsForLabels([sharedRect, sharedRect])

            // Act
            labelCollisionService.updateLabelLayout()

            // Assert
            const contentHigh = labelCreationService.getLabels()[0].labelElement.getContentElement()
            const contentLow = labelCreationService.getLabels()[1].labelElement.getContentElement()
            expect(contentHigh.style.opacity).toBe("1")
            expect(contentLow.style.opacity).toBe("0")
        })

        it("should show badge on the winner label with hidden count", () => {
            // Arrange
            const highLeaf = { ...sampleLeaf, name: "high", path: "/root/high", attributes: { mcc: 100 } } as undefined as Node
            const lowLeaf = { ...otherSampleLeaf, name: "low", path: "/root/low", attributes: { mcc: 10 } } as undefined as Node
            labelCreationService.addLeafLabel(highLeaf, 0)
            labelCreationService.addLeafLabel(lowLeaf, 0)
            const sharedRect = makeRect(100, 120, 50, 150)
            stubRectsForLabels([sharedRect, sharedRect])

            // Act
            labelCollisionService.updateLabelLayout()

            // Assert
            const winnerContent = labelCreationService.getLabels()[0].labelElement.getContentElement()
            const badge = winnerContent.lastElementChild as HTMLDivElement
            expect(badge.textContent).toBe("+1 more")
        })

        it("should not displace labels that do not overlap horizontally", () => {
            // Arrange
            labelCreationService.addLeafLabel(sampleLeaf, 0)
            labelCreationService.addLeafLabel(otherSampleLeaf, 0)
            const leftRect = makeRect(100, 120, 0, 100)
            const rightRect = makeRect(100, 120, 200, 300)
            stubRectsForLabels([leftRect, rightRect])

            // Act
            labelCollisionService.updateLabelLayout()

            // Assert
            const content0 = labelCreationService.getLabels()[0].labelElement.getContentElement()
            const content1 = labelCreationService.getLabels()[1].labelElement.getContentElement()
            expect(content0.style.opacity).toBe("1")
            expect(content1.style.opacity).toBe("1")
            expect(content0.style.transform).toBe("translateY(-20px)")
            expect(content1.style.transform).toBe("translateY(-20px)")
        })

        it("should pick the label with highest metric value as winner", () => {
            // Arrange
            const lowLeaf = { ...sampleLeaf, name: "low", path: "/root/low", attributes: { mcc: 10 } } as undefined as Node
            const highLeaf = { ...otherSampleLeaf, name: "high", path: "/root/high", attributes: { mcc: 200 } } as undefined as Node
            labelCreationService.addLeafLabel(lowLeaf, 0)
            labelCreationService.addLeafLabel(highLeaf, 0)
            const sharedRect = makeRect(100, 120, 50, 150)
            stubRectsForLabels([sharedRect, sharedRect])

            // Act
            labelCollisionService.updateLabelLayout()

            // Assert
            const contentLow = labelCreationService.getLabels()[0].labelElement.getContentElement()
            const contentHigh = labelCreationService.getLabels()[1].labelElement.getContentElement()
            expect(contentLow.style.opacity).toBe("0")
            expect(contentHigh.style.opacity).toBe("1")
        })

        it("should use path as tiebreaker when metric values are equal", () => {
            // Arrange
            const leafA = { ...sampleLeaf, name: "a", path: "/root/a", attributes: { mcc: 50 } } as undefined as Node
            const leafB = { ...otherSampleLeaf, name: "b", path: "/root/b", attributes: { mcc: 50 } } as undefined as Node
            labelCreationService.addLeafLabel(leafA, 0)
            labelCreationService.addLeafLabel(leafB, 0)
            const sharedRect = makeRect(100, 120, 50, 150)
            stubRectsForLabels([sharedRect, sharedRect])

            // Act
            labelCollisionService.updateLabelLayout()

            // Assert — "/root/a" < "/root/b" so leafA wins
            const contentA = labelCreationService.getLabels()[0].labelElement.getContentElement()
            const contentB = labelCreationService.getLabels()[1].labelElement.getContentElement()
            expect(contentA.style.opacity).toBe("1")
            expect(contentB.style.opacity).toBe("0")
        })

        it("should form transitive collision groups", () => {
            // Arrange — A overlaps B, B overlaps C, but A and C don't overlap directly
            const leafA = { ...sampleLeaf, name: "a", path: "/root/a", attributes: { mcc: 100 } } as undefined as Node
            const leafB = { ...sampleLeaf, name: "b", path: "/root/b", attributes: { mcc: 10 } } as undefined as Node
            const leafC = { ...sampleLeaf, name: "c", path: "/root/c", attributes: { mcc: 10 } } as undefined as Node
            labelCreationService.addLeafLabel(leafA, 0)
            labelCreationService.addLeafLabel(leafB, 0)
            labelCreationService.addLeafLabel(leafC, 0)
            // A: 0-100, B: 80-180, C: 160-260 → A∩B and B∩C overlap, but not A∩C
            stubRectsForLabels([makeRect(100, 120, 0, 100), makeRect(100, 120, 80, 180), makeRect(100, 120, 160, 260)])

            // Act
            labelCollisionService.updateLabelLayout()

            // Assert — all three should be in one group, A wins (highest mcc), badge shows +2
            const contentA = labelCreationService.getLabels()[0].labelElement.getContentElement()
            const contentB = labelCreationService.getLabels()[1].labelElement.getContentElement()
            const contentC = labelCreationService.getLabels()[2].labelElement.getContentElement()
            expect(contentA.style.opacity).toBe("1")
            expect(contentB.style.opacity).toBe("0")
            expect(contentC.style.opacity).toBe("0")
            const badge = contentA.lastElementChild as HTMLDivElement
            expect(badge.textContent).toBe("+2 more")
        })

        it("should clean up badges between layout updates", () => {
            // Arrange
            const highLeaf = { ...sampleLeaf, name: "high", path: "/root/high", attributes: { mcc: 100 } } as undefined as Node
            const lowLeaf = { ...otherSampleLeaf, name: "low", path: "/root/low", attributes: { mcc: 10 } } as undefined as Node
            labelCreationService.addLeafLabel(highLeaf, 0)
            labelCreationService.addLeafLabel(lowLeaf, 0)
            const sharedRect = makeRect(100, 120, 50, 150)
            stubRectsForLabels([sharedRect, sharedRect])

            // Act — run layout twice
            labelCollisionService.updateLabelLayout()
            stubRectsForLabels([sharedRect, sharedRect])
            labelCollisionService.updateLabelLayout()

            // Assert — only one badge should exist (old one cleaned up)
            const winnerContent = labelCreationService.getLabels()[0].labelElement.getContentElement()
            const badges = winnerContent.querySelectorAll("div")
            expect(badges.length).toBe(1)
        })
    })

    describe("setSuppressLayout", () => {
        it("should suppress layout when set to true", () => {
            // Arrange
            labelCollisionService.setSuppressLayout(true)

            // Assert
            expect(labelCollisionService["_suppressLayout"]).toBe(true)
        })

        it("should skip collision detection when layout is suppressed", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            labelCreationService.addLeafLabel(sampleLeaf, 0)
            labelCreationService.addLeafLabel(otherSampleLeaf, 0)

            // Act
            labelCollisionService.setSuppressLayout(true)
            labelCollisionService.updateLabelLayout()

            // Assert
            expect(labelCreationService.getLabels().length).toBe(2)
        })
    })

    describe("destroy", () => {
        it("should clear all labels when destroyed", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            labelCreationService.addLeafLabel(sampleLeaf, 0)

            // Act
            labelCollisionService.destroy()

            // Assert
            expect(labelCreationService.getLabels().length).toBe(0)
        })

        it("should dispose connector geometry and remove from scene", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            labelCreationService.addLeafLabel(sampleLeaf, 10)
            labelCollisionService.updateLabelLayout()
            const segments = labelCollisionService["connectorSegments"]
            expect(segments).not.toBeNull()

            // Act
            labelCollisionService.destroy()

            // Assert
            expect(labelCollisionService["connectorSegments"]).toBeNull()
            expect(labelCollisionService["connectorPositions"]).toBeNull()
        })

        it("should be a no-op when no connectors have been created", () => {
            // Arrange
            expect(labelCollisionService["connectorSegments"]).toBeNull()

            // Act & Assert
            expect(() => labelCollisionService.destroy()).not.toThrow()
        })

        it("should clean up badges when destroyed", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            store.dispatch(setHeightMetric({ value: "mcc" }))
            const highLeaf = { ...sampleLeaf, name: "high", path: "/root/high", attributes: { mcc: 100 } } as undefined as Node
            const lowLeaf = { ...otherSampleLeaf, name: "low", path: "/root/low", attributes: { mcc: 10 } } as undefined as Node
            labelCreationService.addLeafLabel(highLeaf, 0)
            labelCreationService.addLeafLabel(lowLeaf, 0)
            const sharedRect = makeRect(100, 120, 50, 150)
            stubRectsForLabels([sharedRect, sharedRect])
            labelCollisionService.updateLabelLayout()

            // Verify badge exists before destroy
            const winnerContent = labelCreationService.getLabels()[0].labelElement.getContentElement()
            expect(winnerContent.querySelectorAll("div").length).toBe(1)

            // Act
            labelCollisionService.destroy()

            // Assert — labels are cleared, badges gone with them
            expect(labelCreationService.getLabels().length).toBe(0)
        })
    })
})
