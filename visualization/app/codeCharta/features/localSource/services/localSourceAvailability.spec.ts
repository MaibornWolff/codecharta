import { TestBed } from "@angular/core/testing"
import { BehaviorSubject } from "rxjs"
import { PreferencesReadWindow } from "../../../stores/preferences/preferences.read.facade"
import { ToastService } from "../../shared/facade"
import { BLOCKED_MESSAGE, LocalSourceAvailability } from "./localSourceAvailability"

describe("LocalSourceAvailability", () => {
    const toastMock = { show: jest.fn() }
    let isSwitchedOn: BehaviorSubject<boolean>

    function availabilityIn({ hasPicker = true, isOn = true }: { hasPicker?: boolean; isOn?: boolean } = {}) {
        if (hasPicker) {
            ;(window as unknown as { showDirectoryPicker: jest.Mock }).showDirectoryPicker = jest.fn()
        }
        isSwitchedOn = new BehaviorSubject(isOn)
        TestBed.configureTestingModule({
            providers: [
                { provide: PreferencesReadWindow, useValue: { localSourceEnabled$: isSwitchedOn } },
                { provide: ToastService, useValue: toastMock }
            ]
        })
        return TestBed.inject(LocalSourceAvailability)
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        delete (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker
    })

    it("should offer local source files where folders can be opened and the reader switched them on", () => {
        // Act
        const availability = availabilityIn()

        // Assert
        expect(availability.isAvailable()).toBe(true)
    })

    it("should hide local source files while they are switched off, and offer them once switched on", () => {
        // Arrange
        const availability = availabilityIn({ isOn: false })
        const whileOff = availability.isAvailable()

        // Act
        isSwitchedOn.next(true)

        // Assert
        expect(whileOff).toBe(false)
        expect(availability.isAvailable()).toBe(true)
    })

    it("should hide local source files where the browser cannot open folders, even when switched on", () => {
        // Act
        const availability = availabilityIn({ hasPicker: false })

        // Assert
        expect(availability.isAvailable()).toBe(false)
    })

    it("should hide local source files for the rest of the session once the browser blocked a folder, and say so once", () => {
        // Arrange
        const availability = availabilityIn()

        // Act
        availability.reportBlocked()
        availability.reportBlocked()

        // Assert
        expect(availability.isAvailable()).toBe(false)
        expect(toastMock.show).toHaveBeenCalledTimes(1)
        expect(toastMock.show).toHaveBeenCalledWith(BLOCKED_MESSAGE, "warning")
    })
})
