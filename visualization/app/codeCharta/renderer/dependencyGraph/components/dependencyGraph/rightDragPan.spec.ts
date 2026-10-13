import { AxisWindow, PannableView } from "../../util/axisWindow"
import { PANNING_ATTRIBUTE } from "./panKey"
import { PannedChart, RightDragPan } from "./rightDragPan"

const VIEW: PannableView = {
    shownWindow: { x: [0, 800], y: [0, 600] },
    reach: { x: [-1000, 2000], y: [-1000, 2000] },
    viewport: { width: 800, height: 600 }
}
const SECONDARY = { button: 2, buttons: 2 }

function mouse(type: string, init: MouseEventInit, target: EventTarget = window): MouseEvent {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, ...init })
    target.dispatchEvent(event)
    return event
}

describe("RightDragPan", () => {
    let chart: jest.Mocked<PannedChart>
    let pan: RightDragPan
    let container: HTMLElement

    const lastShownWindow = (): AxisWindow | undefined => chart.show.mock.calls.at(-1)?.[0]
    const pressAt = (clientX: number, clientY: number, button = SECONDARY) => mouse("mousedown", { ...button, clientX, clientY }, container)
    const dragTo = (clientX: number, clientY: number) => mouse("mousemove", { ...SECONDARY, clientX, clientY })
    const letGo = () => mouse("mouseup", { button: 2 })

    beforeEach(() => {
        jest.useFakeTimers()
        chart = { view: jest.fn(() => VIEW), show: jest.fn() }
        pan = new RightDragPan(chart)
        container = document.createElement("div")
        document.body.appendChild(container)
        pan.listenOver(container)
    })

    afterEach(() => {
        pan.stopListening()
        document.body.replaceChildren()
        jest.useRealTimers()
    })

    it("should move the shown window with a drag of the secondary button, and mark the container while it does", () => {
        // Arrange
        pressAt(100, 100)

        // Act
        dragTo(150, 80)
        const isMarkedWhileDragging = container.hasAttribute(PANNING_ATTRIBUTE)
        letGo()

        // Assert
        expect(lastShownWindow()).toEqual({ x: [-50, 750], y: [20, 620] })
        expect(isMarkedWhileDragging).toBe(true)
        expect(container.hasAttribute(PANNING_ATTRIBUTE)).toBe(false)
    })

    it("should show the window once a frame however often the pointer moves", () => {
        // Arrange
        pressAt(100, 100)

        // Act
        dragTo(120, 100)
        dragTo(140, 100)
        dragTo(160, 100)
        jest.runAllTimers()

        // Assert
        expect(chart.show).toHaveBeenCalledTimes(1)
        expect(lastShownWindow()).toEqual({ x: [-60, 740], y: [0, 600] })
    })

    it("should leave a drag of the primary button, and one before anything is drawn, alone", () => {
        // Arrange
        pressAt(100, 100, { button: 0, buttons: 1 })
        dragTo(150, 80)
        letGo()
        chart.view.mockReturnValue(null)

        // Act
        pressAt(100, 100)
        dragTo(150, 80)
        letGo()

        // Assert
        expect(chart.show).not.toHaveBeenCalled()
    })

    it("should end the pan when the button was let go where no release was heard", () => {
        // Arrange
        pressAt(100, 100)
        dragTo(150, 100)

        // Act
        mouse("mousemove", { buttons: 0, clientX: 400, clientY: 400 })
        dragTo(500, 500)

        // Assert
        expect(lastShownWindow()).toEqual({ x: [-50, 750], y: [0, 600] })
    })

    it("should leave the mark of the space bar on the container", () => {
        // Arrange
        container.setAttribute(PANNING_ATTRIBUTE, "")
        pressAt(100, 100)

        // Act
        dragTo(150, 80)
        letGo()

        // Assert
        expect(container.hasAttribute(PANNING_ATTRIBUTE)).toBe(true)
    })

    it("should open a menu asked for with no button down at once", () => {
        // Arrange
        const openMenu = jest.fn()

        // Act
        pan.openMenuUnlessDragStarts(openMenu)

        // Assert
        expect(openMenu).toHaveBeenCalledTimes(1)
    })

    it("should open a menu asked for on the press only on a release that dragged nothing", () => {
        // Arrange
        const openMenu = jest.fn()
        pressAt(100, 100)
        mouse("contextmenu", {}, container)
        pan.openMenuUnlessDragStarts(openMenu)
        const openedBeforeTheRelease = openMenu.mock.calls.length

        // Act
        dragTo(101, 101)
        letGo()

        // Assert
        expect(openedBeforeTheRelease).toBe(0)
        expect(openMenu).toHaveBeenCalledTimes(1)
        expect(chart.show).not.toHaveBeenCalled()
    })

    it("should open no menu asked for on the press of a drag, and let the next menu through", () => {
        // Arrange
        const openMenu = jest.fn()
        const heardByThePage = jest.fn()
        container.addEventListener("contextmenu", heardByThePage)
        pressAt(100, 100)
        mouse("contextmenu", {}, container)
        pan.openMenuUnlessDragStarts(openMenu)
        dragTo(150, 80)
        letGo()

        // Act
        const nextMenu = mouse("contextmenu", {}, container)

        // Assert
        expect(openMenu).not.toHaveBeenCalled()
        expect(heardByThePage).toHaveBeenCalledTimes(2)
        expect(nextMenu.defaultPrevented).toBe(false)
    })

    it("should swallow the menu a system asks for on the release of a drag, wherever it is released, but no later one", () => {
        // Arrange
        const heardByThePage = jest.fn()
        document.body.addEventListener("contextmenu", heardByThePage)
        pressAt(100, 100)
        dragTo(150, 80)
        letGo()

        // Act
        const menuOfTheRelease = mouse("contextmenu", {}, document.body)
        const laterMenu = mouse("contextmenu", {}, document.body)

        // Assert
        expect(menuOfTheRelease.defaultPrevented).toBe(true)
        expect(laterMenu.defaultPrevented).toBe(false)
        expect(heardByThePage).toHaveBeenCalledTimes(1)
    })

    it("should swallow no menu after a drag once another press followed it, anywhere on the page", () => {
        // Arrange
        pressAt(100, 100)
        dragTo(150, 80)
        letGo()

        // Act
        mouse("mousedown", { button: 2, buttons: 2 }, document.body)
        const menu = mouse("contextmenu", {}, document.body)

        // Assert
        expect(menu.defaultPrevented).toBe(false)
    })

    it("should stop panning once it no longer listens", () => {
        // Arrange
        pan.stopListening()

        // Act
        pressAt(100, 100)
        dragTo(150, 80)
        letGo()

        // Assert
        expect(chart.show).not.toHaveBeenCalled()
    })
})
