import { CodeMapTooltipService } from "./codeMap.tooltip.service"
import { CcState, Node } from "../../codeCharta.model"
import { State } from "@ngrx/store"
import { defaultState } from "../../state/store/state.manager"

describe("CodeMapTooltipService", () => {
    let tooltipService: CodeMapTooltipService
    let state: State<CcState>
    let sampleNode: Node

    beforeEach(() => {
        state = { getValue: () => defaultState } as unknown as State<CcState>
        tooltipService = new CodeMapTooltipService(state)

        sampleNode = {
            name: "sample.ts",
            id: 42,
            attributes: { rloc: 100, mcc: 10, coverage: 80 }
        } as unknown as Node
    })

    afterEach(() => {
        tooltipService.dispose()
    })

    describe("show", () => {
        it("should create tooltip element and make it visible", () => {
            // Act
            tooltipService.show(sampleNode, 100, 200)

            // Assert
            expect(tooltipService.isVisible()).toBe(true)
            expect(tooltipService.getCurrentNodeId()).toBe(42)
            const element = document.getElementById("cc-hover-tooltip")
            expect(element).toBeTruthy()
            expect(element.style.opacity).toBe("1")
        })

        it("should populate tooltip with node name and metrics", () => {
            // Act
            tooltipService.show(sampleNode, 100, 200)

            // Assert
            const element = document.getElementById("cc-hover-tooltip")
            expect(element.textContent).toContain("sample.ts")
        })

        it("should position tooltip near cursor", () => {
            // Act
            tooltipService.show(sampleNode, 100, 200)

            // Assert
            const element = document.getElementById("cc-hover-tooltip")
            expect(element.style.left).toBe("112px")
            expect(element.style.top).toBe("212px")
        })
    })

    describe("hide", () => {
        it("should hide the tooltip", () => {
            // Arrange
            tooltipService.show(sampleNode, 100, 200)

            // Act
            tooltipService.hide()

            // Assert
            expect(tooltipService.isVisible()).toBe(false)
            expect(tooltipService.getCurrentNodeId()).toBeNull()
            const element = document.getElementById("cc-hover-tooltip")
            expect(element.style.opacity).toBe("0")
        })

        it("should be a no-op if tooltip was never shown", () => {
            // Act & Assert
            expect(() => tooltipService.hide()).not.toThrow()
            expect(tooltipService.isVisible()).toBe(false)
        })
    })

    describe("updatePosition", () => {
        it("should update tooltip position when visible", () => {
            // Arrange
            tooltipService.show(sampleNode, 100, 200)

            // Act
            tooltipService.updatePosition(300, 400)

            // Assert
            const element = document.getElementById("cc-hover-tooltip")
            expect(element.style.left).toBe("312px")
            expect(element.style.top).toBe("412px")
        })

        it("should not update when not visible", () => {
            // Act & Assert
            expect(() => tooltipService.updatePosition(300, 400)).not.toThrow()
        })
    })

    describe("positionTooltip edge clamping", () => {
        it("should clamp tooltip to left edge when flipped position would go off-screen left", () => {
            // Arrange
            // Use a narrow viewport (100px) and clientX = 5 so the right-edge flip triggers:
            // initial x = 5 + 12 = 17; rect.width = 200; 17 + 200 = 217 > 100 - 8 = 92 → flip occurs.
            // After flip: x = 5 - 200 - 12 = -207, which is < VIEWPORT_PADDING (8).
            // The left-edge clamp must set x = 8.
            Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: 100 })
            tooltipService.show(sampleNode, 5, 200)
            const element = document.getElementById("cc-hover-tooltip")
            jest.spyOn(element, "getBoundingClientRect").mockReturnValue({
                width: 200,
                height: 20,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                x: 0,
                y: 0,
                toJSON: () => ({})
            } as DOMRect)

            // Act
            tooltipService.updatePosition(5, 200)

            // Assert
            expect(element.style.left).toBe("8px")
        })

        it("should clamp tooltip to top edge when flipped position would go off-screen top", () => {
            // Arrange
            // Use a short viewport (50px) and clientY = 5 so the bottom-edge flip triggers:
            // initial y = 5 + 12 = 17; rect.height = 100; 17 + 100 = 117 > 50 - 8 = 42 → flip occurs.
            // After flip: y = 5 - 100 - 12 = -107, which is < VIEWPORT_PADDING (8).
            // The top-edge clamp must set y = 8.
            Object.defineProperty(window, "innerHeight", { configurable: true, writable: true, value: 50 })
            tooltipService.show(sampleNode, 200, 5)
            const element = document.getElementById("cc-hover-tooltip")
            jest.spyOn(element, "getBoundingClientRect").mockReturnValue({
                width: 20,
                height: 100,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                x: 0,
                y: 0,
                toJSON: () => ({})
            } as DOMRect)

            // Act
            tooltipService.updatePosition(200, 5)

            // Assert
            expect(element.style.top).toBe("8px")
        })
    })

    describe("getRect", () => {
        it("should return null when not visible", () => {
            // Act & Assert
            expect(tooltipService.getRect()).toBeNull()
        })

        it("should return DOMRect when visible", () => {
            // Arrange
            tooltipService.show(sampleNode, 100, 200)

            // Act
            const rect = tooltipService.getRect()

            // Assert
            expect(rect).toBeDefined()
        })
    })

    describe("dispose", () => {
        it("should remove tooltip element from DOM", () => {
            // Arrange
            tooltipService.show(sampleNode, 100, 200)

            // Act
            tooltipService.dispose()

            // Assert
            expect(document.getElementById("cc-hover-tooltip")).toBeNull()
            expect(tooltipService.isVisible()).toBe(false)
        })
    })
})
