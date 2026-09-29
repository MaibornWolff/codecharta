import type { ECharts } from "echarts/core"
import { BoxDragGesture, BoxDragHandlers, DRAG_THRESHOLD_PX } from "./boxDragGesture"

const chart = { convertFromPixel: (_finder: unknown, [x, y]: number[]) => [x / 2, y / 2] } as unknown as ECharts

function pointer(offsetX: number, offsetY: number, button = 0) {
    return { offsetX, offsetY, event: { button } as MouseEvent } as {
        offsetX: number
        offsetY: number
        event: MouseEvent
        __ecRoamConsumed?: boolean
    }
}

describe("BoxDragGesture", () => {
    let handlers: BoxDragHandlers
    let gesture: BoxDragGesture

    beforeEach(() => {
        jest.useFakeTimers()
        handlers = { canDragBox: jest.fn(() => true), onBoxDragged: jest.fn(), onBoxDragEnded: jest.fn() }
        gesture = new BoxDragGesture(chart, handlers)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it("should keep the graph from panning and drag the pressed box by the pointer, in layout units, once per frame", () => {
        // Arrange
        const press = pointer(10, 10)

        // Act
        gesture.press("/root/a.ts", press)
        gesture.move(pointer(20, 10))
        gesture.move(pointer(30, 14))
        jest.runOnlyPendingTimers()

        // Assert
        expect(press.__ecRoamConsumed).toBe(true)
        expect(handlers.canDragBox).toHaveBeenCalledWith("/root/a.ts", [5, 5])
        expect(handlers.onBoxDragged).toHaveBeenCalledTimes(1)
        expect(handlers.onBoxDragged).toHaveBeenCalledWith("/root/a.ts", 10, 2)
    })

    it("should leave a press it may not drag to the graph's pan", () => {
        // Arrange
        handlers.canDragBox = jest.fn(() => false)
        const press = pointer(10, 10)

        // Act
        gesture.press("/root", press)
        gesture.move(pointer(40, 40))
        gesture.release()

        // Assert
        expect(press.__ecRoamConsumed).toBeUndefined()
        expect(handlers.onBoxDragged).not.toHaveBeenCalled()
    })

    it("should ignore any button but the primary one", () => {
        // Act
        gesture.press("/root/a.ts", pointer(10, 10, 2))
        gesture.move(pointer(40, 40))
        gesture.release()

        // Assert
        expect(handlers.canDragBox).not.toHaveBeenCalled()
        expect(handlers.onBoxDragged).not.toHaveBeenCalled()
    })

    it("should report what is left on release and take the click that ends a drag", () => {
        // Act
        gesture.press("/root/a.ts", pointer(10, 10))
        gesture.move(pointer(30, 10))
        gesture.release()

        // Assert
        expect(handlers.onBoxDragged).toHaveBeenCalledWith("/root/a.ts", 10, 0)
        expect(handlers.onBoxDragEnded).toHaveBeenCalledTimes(1)
        expect(gesture.takesClick()).toBe(true)
        expect(gesture.takesClick()).toBe(false)
    })

    it("should leave the click to a press that barely moved", () => {
        // Act
        gesture.press("/root/a.ts", pointer(10, 10))
        gesture.move(pointer(10 + DRAG_THRESHOLD_PX, 10))
        gesture.release()

        // Assert
        expect(gesture.takesClick()).toBe(false)
    })

    it("should drop a drag that is cancelled midway", () => {
        // Act
        gesture.press("/root/a.ts", pointer(10, 10))
        gesture.move(pointer(30, 10))
        gesture.cancel()
        jest.runOnlyPendingTimers()
        gesture.release()

        // Assert
        expect(handlers.onBoxDragged).not.toHaveBeenCalled()
    })

    it("should drag by touch, which carries no button", () => {
        // Arrange
        const touch = { offsetX: 10, offsetY: 10, event: {} as TouchEvent }

        // Act
        gesture.press("/root/a.ts", touch)

        // Assert
        expect(handlers.canDragBox).toHaveBeenCalled()
    })
})
