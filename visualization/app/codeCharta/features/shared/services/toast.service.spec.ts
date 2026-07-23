import { TestBed } from "@angular/core/testing"
import { ToastService } from "./toast.service"

describe("ToastService", () => {
    let toastService: ToastService

    beforeEach(() => {
        jest.useFakeTimers()
        TestBed.configureTestingModule({})
        toastService = TestBed.inject(ToastService)
    })

    afterEach(() => {
        jest.clearAllTimers()
        jest.useRealTimers()
    })

    it("should hold no messages initially", () => {
        // Arrange & Act
        const messages = toastService.messages()

        // Assert
        expect(messages).toEqual([])
    })

    it("should add an info message by default when show is called", () => {
        // Arrange & Act
        toastService.show("switched to the map view")

        // Assert
        expect(toastService.messages()).toEqual([{ id: 0, text: "switched to the map view", severity: "info" }])
    })

    it("should add a message with the requested severity", () => {
        // Arrange & Act
        toastService.show("something went wrong", "error")

        // Assert
        expect(toastService.messages()[0].severity).toBe("error")
    })

    it("should give each message a unique id so stacked messages never collide", () => {
        // Arrange & Act
        toastService.show("first")
        toastService.show("second")

        // Assert
        expect(toastService.messages().map(message => message.id)).toEqual([0, 1])
    })

    it("should auto-dismiss a message after the timeout elapses", () => {
        // Arrange
        toastService.show("temporary")

        // Act
        jest.advanceTimersByTime(5000)

        // Assert
        expect(toastService.messages()).toEqual([])
    })

    it("should dismiss only the requested message when dismiss is called", () => {
        // Arrange
        const keptId = toastService.show("keep me")
        const dismissedId = toastService.show("remove me")

        // Act
        toastService.dismiss(dismissedId)

        // Assert
        expect(toastService.messages().map(message => message.id)).toEqual([keptId])
    })

    it("should not throw when a pending auto-dismiss fires for an already dismissed message", () => {
        // Arrange
        const id = toastService.show("dismissed early")
        toastService.dismiss(id)

        // Act & Assert
        expect(() => jest.advanceTimersByTime(5000)).not.toThrow()
        expect(toastService.messages()).toEqual([])
    })
})
