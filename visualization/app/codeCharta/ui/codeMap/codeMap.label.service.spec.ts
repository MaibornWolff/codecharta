import { TestBed } from "@angular/core/testing"
import { CodeMapLabelService } from "./codeMap.label.service"
import { CodeMapTooltipService } from "./codeMap.tooltip.service"
import { CcState, Node } from "../../codeCharta.model"
import { Group, BoxGeometry, Mesh } from "three"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { ThreeRendererService } from "./threeViewer/threeRenderer.service"
import { setAmountOfTopLabels } from "../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setShowMetricLabelNameValue } from "../../state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { setShowMetricLabelNodeName } from "../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { State, Store, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../state/store/state.manager"

describe("CodeMapLabelService", () => {
    let state: State<CcState>
    let store: Store<CcState>
    let threeSceneService: ThreeSceneService
    let threeRendererService: ThreeRendererService
    let tooltipService: Partial<CodeMapTooltipService>
    let codeMapLabelService: CodeMapLabelService
    let sampleLeaf: Node
    let otherSampleLeaf: Node

    beforeEach(() => {
        restartSystem()
        rebuild()
        withMockedThreeSceneService()
    })

    function restartSystem() {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        store = TestBed.inject(Store)
        state = TestBed.inject(State)
        threeSceneService = TestBed.inject(ThreeSceneService)
        threeRendererService = TestBed.inject(ThreeRendererService)
        tooltipService = {
            getRect: jest.fn().mockReturnValue(null),
            isVisible: jest.fn().mockReturnValue(false)
        }
    }

    function rebuild() {
        codeMapLabelService = new CodeMapLabelService(
            state,
            threeSceneService,
            threeRendererService,
            tooltipService as CodeMapTooltipService
        )
    }

    function withMockedThreeSceneService() {
        threeSceneService.mapGeometry = new Group().add(new Mesh(new BoxGeometry(10, 10, 10)))
        threeSceneService.labels = new Group()

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
    }

    describe("constructor", () => {
        it("should not have any labels", () => {
            expect(codeMapLabelService["labels"].length).toBe(0)
        })

        it("should subscribe to afterRender$ and call updateLabelLayout when emitted", () => {
            // Arrange
            const updateLabelLayout = jest.spyOn(codeMapLabelService, "updateLabelLayout")

            // Act
            threeRendererService["_afterRender$"].next()

            // Assert
            expect(updateLabelLayout).toHaveBeenCalledTimes(1)
        })
    })

    describe("addLeafLabel", () => {
        beforeEach(() => {
            store.dispatch(setAmountOfTopLabels({ value: 1 }))
            store.dispatch(setHeightMetric({ value: "mcc" }))
        })

        it("should add a CSS2DObject label to the scene", () => {
            store.dispatch(setShowMetricLabelNameValue({ value: true }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            expect(codeMapLabelService["labels"].length).toBe(1)
            expect(threeSceneService.labels.children.length).toBe(1)
        })

        it("should not add label if both show options are false and enforceLabel is false", () => {
            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: false }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            expect(codeMapLabelService["labels"].length).toBe(0)
        })

        it("should add label with enforceLabel even when show options are false", () => {
            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: false }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0, true)

            expect(codeMapLabelService["labels"].length).toBe(1)
        })

        it("should store node reference in userData", () => {
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            const cssObject = codeMapLabelService["labels"][0].cssObject
            expect(cssObject.userData.node).toBe(sampleLeaf)
        })

        it("should create wrapper with content child", () => {
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            const element = codeMapLabelService["labels"][0].cssObject.element
            expect(element.firstElementChild).toBeTruthy()
            expect(element.firstElementChild.textContent).toContain("sample")
        })
    })

    describe("clearLabels", () => {
        it("should clear all labels from scene and internal list", () => {
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)
            codeMapLabelService.addLeafLabel(otherSampleLeaf, 0)

            expect(codeMapLabelService["labels"].length).toBe(2)

            codeMapLabelService.clearLabels()

            expect(codeMapLabelService["labels"].length).toBe(0)
            expect(threeSceneService.labels.children.length).toBe(0)
        })

        it("should clear connector SVG lines", () => {
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            // Manually set up a fake SVG to verify it gets cleared
            codeMapLabelService["connectorSvg"] = document.createElementNS("http://www.w3.org/2000/svg", "svg")
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
            codeMapLabelService["connectorSvg"].appendChild(line)

            codeMapLabelService.clearLabels()

            expect(codeMapLabelService["connectorSvg"].innerHTML).toBe("")
        })
    })

    describe("clearTemporaryLabel", () => {
        it("should clear label for the correct node only", () => {
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)
            codeMapLabelService.addLeafLabel(otherSampleLeaf, 0)

            expect(codeMapLabelService["labels"].length).toBe(2)

            codeMapLabelService.clearTemporaryLabel(sampleLeaf)

            expect(codeMapLabelService["labels"].length).toBe(1)
            expect(codeMapLabelService["labels"][0].node).toEqual(otherSampleLeaf)
        })

        it("should not clear if no label exists for a given node", () => {
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            codeMapLabelService.clearTemporaryLabel(otherSampleLeaf)

            expect(codeMapLabelService["labels"].length).toBe(1)
            expect(codeMapLabelService["labels"][0].node).toEqual(sampleLeaf)
        })
    })

    describe("hasLabelForNode", () => {
        it("should return true if label exists for node", () => {
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            expect(codeMapLabelService.hasLabelForNode(sampleLeaf)).toBe(true)
        })

        it("should return false if no label exists for node", () => {
            expect(codeMapLabelService.hasLabelForNode(sampleLeaf)).toBe(false)
        })
    })

    describe("updateLabelLayout", () => {
        it("should be a no-op for zero labels", () => {
            // Should not throw
            codeMapLabelService.updateLabelLayout()

            expect(codeMapLabelService["labels"].length).toBe(0)
        })

        it("should process a single label without collision avoidance", () => {
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            // Should not throw
            codeMapLabelService.updateLabelLayout()

            expect(codeMapLabelService["labels"].length).toBe(1)
        })

        it("should apply transform styles to label content when processing labels", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)
            codeMapLabelService.addLeafLabel(otherSampleLeaf, 0)
            const content0 = codeMapLabelService["labels"][0].cssObject.element.firstElementChild as HTMLDivElement
            const content1 = codeMapLabelService["labels"][1].cssObject.element.firstElementChild as HTMLDivElement

            // Act
            codeMapLabelService.updateLabelLayout()

            // Assert — resolveCollisions writes transform on every label content element
            expect(content0.style.transform).toContain("translateY")
            expect(content1.style.transform).toContain("translateY")
        })
    })

    describe("label layout algorithm", () => {
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
            // Stub getBoundingClientRect on each label's content element in order
            for (let i = 0; i < rects.length; i++) {
                const content = codeMapLabelService["labels"][i].cssObject.element.firstElementChild as HTMLDivElement
                jest.spyOn(content, "getBoundingClientRect").mockReturnValue(rects[i])
            }
        }

        beforeEach(() => {
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
        })

        it("should set transform style on each label content element during layout", () => {
            // Arrange
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)
            const content = codeMapLabelService["labels"][0].cssObject.element.firstElementChild as HTMLDivElement
            jest.spyOn(content, "getBoundingClientRect").mockReturnValue(makeRect(100, 120, 50, 150))

            // Act
            codeMapLabelService.updateLabelLayout()

            // Assert — the transform must encode the BASE_OFFSET_PX (-20px) with no extra displacement
            expect(content.style.transform).toBe("translateY(-20px)")
        })

        it("should displace a second label downward to avoid overlap with the first", () => {
            // Arrange — two labels with identical horizontal extent, fully overlapping vertically
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)
            codeMapLabelService.addLeafLabel(otherSampleLeaf, 0)

            // Both labels occupy the exact same screen rectangle so they fully overlap
            const sharedRect = makeRect(100, 120, 50, 150)
            stubRectsForLabels([sharedRect, sharedRect])

            // Act
            codeMapLabelService.updateLabelLayout()

            // Assert — one label stays at baseline, the other must be displaced downward.
            // Which label "wins" depends on the path tiebreaker, so check both.
            const content0 = codeMapLabelService["labels"][0].cssObject.element.firstElementChild as HTMLDivElement
            const content1 = codeMapLabelService["labels"][1].cssObject.element.firstElementChild as HTMLDivElement
            const transforms = [content0.style.transform, content1.style.transform]
            const offsets = transforms.map(t => {
                const match = t.match(/translateY\((-?\d+(?:\.\d+)?)px\)/)
                return match ? Number.parseFloat(match[1]) : null
            })
            // One label should remain at baseline (-20px), the other should be displaced further down
            expect(offsets).toContainEqual(-20)
            expect(offsets.some(o => o > -20)).toBe(true)
        })

        it("should not displace labels that do not overlap horizontally", () => {
            // Arrange — two labels with non-overlapping horizontal extents
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)
            codeMapLabelService.addLeafLabel(otherSampleLeaf, 0)

            const leftRect = makeRect(100, 120, 0, 100)
            const rightRect = makeRect(100, 120, 200, 300)
            stubRectsForLabels([leftRect, rightRect])

            // Act
            codeMapLabelService.updateLabelLayout()

            // Assert — neither label collides, so both keep the base offset transform
            const content0 = codeMapLabelService["labels"][0].cssObject.element.firstElementChild as HTMLDivElement
            const content1 = codeMapLabelService["labels"][1].cssObject.element.firstElementChild as HTMLDivElement
            expect(content0.style.transform).toBe("translateY(-20px)")
            expect(content1.style.transform).toBe("translateY(-20px)")
        })

        it("should call getBoundingClientRect on every label content element during layout", () => {
            // Arrange
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)
            codeMapLabelService.addLeafLabel(otherSampleLeaf, 0)
            const spies = codeMapLabelService["labels"].map(l => {
                const content = l.cssObject.element.firstElementChild as HTMLDivElement
                return jest.spyOn(content, "getBoundingClientRect").mockReturnValue(makeRect(100, 120, 50, 150))
            })

            // Act
            codeMapLabelService.updateLabelLayout()

            // Assert — every label's content element must have its rect measured exactly once
            for (const spy of spies) {
                expect(spy).toHaveBeenCalledTimes(1)
            }
        })

        it("should resolve labels at the same screen Y in consistent order using path tiebreaker", () => {
            // Arrange — two labels at the exact same screen Y position, run twice from fresh state
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)
            codeMapLabelService.addLeafLabel(otherSampleLeaf, 0)

            const sharedRect = makeRect(100, 120, 50, 150)
            stubRectsForLabels([sharedRect, sharedRect])

            // Act — first run
            codeMapLabelService.updateLabelLayout()
            const labels = codeMapLabelService["labels"]
            const offset0First = labels[0].appliedOffset
            const offset1First = labels[1].appliedOffset

            // Reset applied offsets to simulate fresh state, re-run
            labels[0].appliedOffset = 0
            labels[1].appliedOffset = 0
            stubRectsForLabels([sharedRect, sharedRect])
            codeMapLabelService.updateLabelLayout()

            // Assert — same label gets the same offset in both runs (deterministic ordering)
            expect(labels[0].appliedOffset).toBe(offset0First)
            expect(labels[1].appliedOffset).toBe(offset1First)
        })

        it("should use path as tiebreaker when rect.top values are equal", () => {
            // Arrange — labels with paths that sort in a known order: "/root/a" < "/root/b"
            const leafA = { ...sampleLeaf, name: "a", path: "/root/a" } as undefined as Node
            const leafB = { ...otherSampleLeaf, name: "b", path: "/root/b" } as undefined as Node
            codeMapLabelService.addLeafLabel(leafA, 0)
            codeMapLabelService.addLeafLabel(leafB, 0)

            // Both at the same Y position
            const sharedRect = makeRect(100, 120, 50, 150)
            stubRectsForLabels([sharedRect, sharedRect])

            // Act
            codeMapLabelService.updateLabelLayout()

            // Assert — leafA (path "/root/a") should win priority (no offset),
            // leafB should be displaced downward
            const contentA = codeMapLabelService["labels"][0].cssObject.element.firstElementChild as HTMLDivElement
            const contentB = codeMapLabelService["labels"][1].cssObject.element.firstElementChild as HTMLDivElement
            expect(contentA.style.transform).toBe("translateY(-20px)")
            const match = contentB.style.transform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/)
            expect(match).not.toBeNull()
            expect(Number.parseFloat(match[1])).toBeGreaterThan(-20)
        })

        it("should clear connector SVG lines at the start of each drawConnectors call", () => {
            // Arrange
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)
            const content = codeMapLabelService["labels"][0].cssObject.element.firstElementChild as HTMLDivElement
            jest.spyOn(content, "getBoundingClientRect").mockReturnValue(makeRect(100, 120, 50, 150))

            // Prime the SVG element so the next call starts from a known state
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
            const staleLines = document.createElementNS("http://www.w3.org/2000/svg", "line")
            svg.appendChild(staleLines)
            codeMapLabelService["connectorSvg"] = svg

            // Act
            codeMapLabelService.updateLabelLayout()

            // Assert — the SVG must have been wiped before new connectors are written
            // (drawConnectors does svg.innerHTML = "" immediately after acquiring the SVG element)
            expect(codeMapLabelService["connectorSvg"]).toBe(svg)
            // The stale line element should no longer be a child of the SVG
            expect(svg.contains(staleLines)).toBe(false)
        })
    })

    describe("setSuppressLayout", () => {
        it("should suppress layout when set to true", () => {
            codeMapLabelService.setSuppressLayout(true)

            expect(codeMapLabelService["_suppressLayout"]).toBe(true)
        })

        it("should re-enable layout when set to false", () => {
            codeMapLabelService.setSuppressLayout(true)
            codeMapLabelService.setSuppressLayout(false)

            expect(codeMapLabelService["_suppressLayout"]).toBe(false)
        })

        it("should skip collision detection when layout is suppressed", () => {
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)
            codeMapLabelService.addLeafLabel(otherSampleLeaf, 0)

            codeMapLabelService.setSuppressLayout(true)
            codeMapLabelService.updateLabelLayout()

            // Connectors should be cleared but no collision resolution should run
            expect(codeMapLabelService["labels"].length).toBe(2)
        })
    })

    describe("scale", () => {
        it("should be a no-op (labels are cleared and recreated)", () => {
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            // Should not throw
            codeMapLabelService.scale()

            expect(codeMapLabelService["labels"].length).toBe(1)
        })
    })

    describe("suppressLabelForNode", () => {
        it("should set opacity to 0 for the matching label", () => {
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            codeMapLabelService.suppressLabelForNode(sampleLeaf)

            const content = codeMapLabelService["labels"][0].cssObject.element.firstElementChild as HTMLDivElement
            expect(content.style.opacity).toBe("0")
            expect(codeMapLabelService["suppressedLabel"]).toBe(codeMapLabelService["labels"][0])
        })

        it("should not suppress if node has no label", () => {
            codeMapLabelService.suppressLabelForNode(sampleLeaf)

            expect(codeMapLabelService["suppressedLabel"]).toBeNull()
        })
    })

    describe("restoreSuppressedLabel", () => {
        it("should restore opacity to 1 for the suppressed label", () => {
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            codeMapLabelService.suppressLabelForNode(sampleLeaf)
            codeMapLabelService.restoreSuppressedLabel()

            const content = codeMapLabelService["labels"][0].cssObject.element.firstElementChild as HTMLDivElement
            expect(content.style.opacity).toBe("1")
            expect(codeMapLabelService["suppressedLabel"]).toBeNull()
        })

        it("should be a no-op if nothing is suppressed", () => {
            expect(() => codeMapLabelService.restoreSuppressedLabel()).not.toThrow()
        })
    })

    describe("destroy", () => {
        it("should remove the connector SVG element from the DOM", () => {
            // Arrange — attach the SVG to a real parent so we can assert removal
            const parent = document.createElement("div")
            document.body.appendChild(parent)
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
            parent.appendChild(svg)
            codeMapLabelService["connectorSvg"] = svg

            // Act
            codeMapLabelService.destroy()

            // Assert — the SVG must have been detached from its parent
            expect(parent.contains(svg)).toBe(false)
            expect(codeMapLabelService["connectorSvg"]).toBeNull()

            // Cleanup
            document.body.removeChild(parent)
        })

        it("should clear all labels and set connectorSvg to null even without a parent container", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
            codeMapLabelService["connectorSvg"] = svg

            // Act
            codeMapLabelService.destroy()

            // Assert
            expect(codeMapLabelService["labels"].length).toBe(0)
            expect(codeMapLabelService["connectorSvg"]).toBeNull()
        })

        it("should be a no-op when no connector SVG has been created", () => {
            // Arrange — connectorSvg is null from construction
            expect(codeMapLabelService["connectorSvg"]).toBeNull()

            // Act / Assert — must not throw
            expect(() => codeMapLabelService.destroy()).not.toThrow()
        })
    })
})
