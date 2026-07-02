import { TestBed } from "@angular/core/testing"
import { State, Store } from "@ngrx/store"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { ColorMode } from "../../../../codeCharta.model"
import { setColorMode } from "../../../../mapState/store/colorMode/colorMode.actions"
import { Print3DButtonComponent } from "./print3DButton.component"

describe("Print3DButtonComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [Print3DButtonComponent],
            providers: [
                { provide: State, useValue: { getValue: () => ({ mapState: { colorMode: ColorMode.absolute } }) } },
                { provide: Store, useValue: { select: jest.fn(() => of(ColorMode.absolute)), dispatch: jest.fn() } }
            ]
        })

        HTMLDialogElement.prototype.showModal = jest.fn()
        HTMLDialogElement.prototype.close = jest.fn()
    })

    it("should render the button labelled 3D Print", async () => {
        // Arrange & Act
        await render(Print3DButtonComponent)

        // Assert
        const button = screen.getByRole("button", { name: "3D Print" })
        expect(button).not.toBe(null)
    })

    it("should set showDialog to true when color mode is absolute", async () => {
        // Arrange
        const state = { getValue: () => ({ mapState: { colorMode: ColorMode.absolute } }) }
        const store = { select: jest.fn(() => of(ColorMode.absolute)), dispatch: jest.fn() }

        const { fixture } = await render(Print3DButtonComponent, {
            excludeComponentDeclaration: true,
            providers: [
                { provide: State, useValue: state },
                { provide: Store, useValue: store }
            ]
        })
        const errorDialogOpenSpy = jest.spyOn(fixture.componentInstance.errorDialog(), "open")

        // Act
        screen.getByRole("button", { name: "3D Print" }).click()

        // Assert
        expect(fixture.componentInstance.showDialog()).toBe(true)
        expect(errorDialogOpenSpy).not.toHaveBeenCalled()
    })

    it("should open error dialog when color mode is not absolute", async () => {
        // Arrange
        const state = { getValue: () => ({ mapState: { colorMode: ColorMode.weightedGradient } }) }
        const store = { select: jest.fn(() => of(ColorMode.weightedGradient)), dispatch: jest.fn() }

        const { fixture } = await render(Print3DButtonComponent, {
            excludeComponentDeclaration: true,
            providers: [
                { provide: State, useValue: state },
                { provide: Store, useValue: store }
            ]
        })
        const errorDialogOpenSpy = jest.spyOn(fixture.componentInstance.errorDialog(), "open")

        // Act
        screen.getByRole("button", { name: "3D Print" }).click()

        // Assert
        expect(fixture.componentInstance.showDialog()).toBe(false)
        expect(errorDialogOpenSpy).toHaveBeenCalledWith(expect.objectContaining({ title: expect.any(String) }))
    })

    it("should switch to absolute color mode and open dialog when resolveErrorCallback runs", async () => {
        // Arrange
        const state = { getValue: () => ({ mapState: { colorMode: ColorMode.weightedGradient } }) }
        const store = { dispatch: jest.fn(), select: jest.fn(() => of(ColorMode.absolute)) }

        const { fixture } = await render(Print3DButtonComponent, {
            excludeComponentDeclaration: true,
            providers: [
                { provide: State, useValue: state },
                { provide: Store, useValue: store }
            ]
        })
        const errorDialogOpenSpy = jest.spyOn(fixture.componentInstance.errorDialog(), "open")

        screen.getByRole("button", { name: "3D Print" }).click()
        const errorDialogData = errorDialogOpenSpy.mock.calls[0][0]

        // Act
        jest.useFakeTimers()
        errorDialogData.resolveErrorData.onResolveErrorClick()
        jest.runAllTimers()

        // Assert
        expect(store.dispatch).toHaveBeenCalledWith(setColorMode({ value: ColorMode.absolute }))
        expect(fixture.componentInstance.showDialog()).toBe(true)
    })
})
