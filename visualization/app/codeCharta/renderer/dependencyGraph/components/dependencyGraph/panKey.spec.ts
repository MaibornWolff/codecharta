import { PANNING_ATTRIBUTE, PanKey } from "./panKey"

function pressSpace(target: EventTarget = window): KeyboardEvent {
    const event = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true })
    target.dispatchEvent(event)
    return event
}

function releaseSpace(): KeyboardEvent {
    const event = new KeyboardEvent("keyup", { key: " ", bubbles: true, cancelable: true })
    window.dispatchEvent(event)
    return event
}

describe("PanKey", () => {
    let panKey: PanKey
    let container: HTMLElement

    beforeEach(() => {
        panKey = new PanKey()
        container = document.createElement("div")
        document.body.appendChild(container)
        panKey.listenOver(container)
    })

    afterEach(() => {
        panKey.stopListening()
        document.body.replaceChildren()
    })

    it("should be held, and mark the container, while space is down with the pointer over the graph", () => {
        // Arrange
        container.dispatchEvent(new MouseEvent("mouseenter"))

        // Act
        const press = pressSpace()

        // Assert
        expect(panKey.isHeld).toBe(true)
        expect(container.hasAttribute(PANNING_ATTRIBUTE)).toBe(true)
        expect(press.defaultPrevented).toBe(true)
    })

    it("should let go on release and keep that release from clicking the focused button", () => {
        // Arrange
        container.dispatchEvent(new MouseEvent("mouseenter"))
        pressSpace()
        const repeatedPress = pressSpace()

        // Act
        const release = releaseSpace()

        // Assert
        expect(panKey.isHeld).toBe(false)
        expect(container.hasAttribute(PANNING_ATTRIBUTE)).toBe(false)
        expect(repeatedPress.defaultPrevented).toBe(true)
        expect(release.defaultPrevented).toBe(true)
    })

    it("should leave space alone while the pointer is elsewhere", () => {
        // Arrange
        container.dispatchEvent(new MouseEvent("mouseenter"))
        container.dispatchEvent(new MouseEvent("mouseleave"))

        // Act
        const press = pressSpace()
        const release = releaseSpace()

        // Assert
        expect(panKey.isHeld).toBe(false)
        expect(press.defaultPrevented).toBe(false)
        expect(release.defaultPrevented).toBe(false)
    })

    it("should leave a space typed into a field to the field", () => {
        // Arrange
        container.dispatchEvent(new MouseEvent("mouseenter"))
        const field = document.createElement("input")
        document.body.appendChild(field)

        // Act
        pressSpace(field)

        // Assert
        expect(panKey.isHeld).toBe(false)
    })

    it("should leave a space another handler took to that handler", () => {
        // Arrange
        container.dispatchEvent(new MouseEvent("mouseenter"))
        const button = document.createElement("button")
        button.addEventListener("keydown", event => event.preventDefault())
        document.body.appendChild(button)

        // Act
        pressSpace(button)

        // Assert
        expect(panKey.isHeld).toBe(false)
    })

    it("should ignore other keys", () => {
        // Arrange
        container.dispatchEvent(new MouseEvent("mouseenter"))

        // Act
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }))

        // Assert
        expect(panKey.isHeld).toBe(false)
    })

    it("should let go when the window loses the focus, as the release then never arrives", () => {
        // Arrange
        container.dispatchEvent(new MouseEvent("mouseenter"))
        pressSpace()

        // Act
        window.dispatchEvent(new Event("blur"))

        // Assert
        expect(panKey.isHeld).toBe(false)
    })

    it("should stop listening", () => {
        // Arrange
        container.dispatchEvent(new MouseEvent("mouseenter"))
        pressSpace()

        // Act
        panKey.stopListening()
        container.dispatchEvent(new MouseEvent("mouseenter"))
        pressSpace()

        // Assert
        expect(panKey.isHeld).toBe(false)
        expect(container.hasAttribute(PANNING_ATTRIBUTE)).toBe(false)
    })
})
