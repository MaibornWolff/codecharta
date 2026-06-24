import { Component, output } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { State, Store } from "@ngrx/store"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { ColorMode } from "../../../../codeCharta.model"
import { setColorMode } from "../../../../state/store/dynamicSettings/colorMode/colorMode.actions"
import { ActionIconComponent } from "../../../../ui/actionIcon/actionIcon.component"
import { ErrorDialogComponent } from "../../../../ui/dialogs/errorDialog/errorDialog.component"
import { Export3DMapButtonComponent } from "./export3DMapButton.component"

// The real export dialog needs a fully initialized Three.js scene in its constructor.
// This button test only cares about the showDialog signal, so the dialog is stubbed.
@Component({ selector: "cc-export-3D-map-dialog", template: "", standalone: true })
class StubExport3DMapDialogComponent {
    readonly closed = output<void>()
}

const componentImports = [ActionIconComponent, ErrorDialogComponent, StubExport3DMapDialogComponent]

describe("Export3DMapButtonComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [Export3DMapButtonComponent],
            providers: [
                { provide: State, useValue: { getValue: () => ({ dynamicSettings: { colorMode: ColorMode.absolute } }) } },
                { provide: Store, useValue: { select: jest.fn(() => of(ColorMode.absolute)), dispatch: jest.fn() } }
            ]
        })

        HTMLDialogElement.prototype.showModal = jest.fn()
        HTMLDialogElement.prototype.close = jest.fn()
    })

    it("should render the button", async function () {
        await render(Export3DMapButtonComponent, { componentImports })
        const exportButton = screen.getByRole("button")
        expect(exportButton).not.toBe(null)
    })

    it("should set showDialog to true when button is clicked with color mode absolute", async function () {
        const state = { getValue: () => ({ dynamicSettings: { colorMode: "absolute" } }) }
        const store = { select: jest.fn(() => of(ColorMode.absolute)), dispatch: jest.fn() }

        const { fixture } = await render(Export3DMapButtonComponent, {
            excludeComponentDeclaration: true,
            componentImports,
            providers: [
                { provide: State, useValue: state },
                { provide: Store, useValue: store }
            ]
        })
        const errorDialogOpenSpy = jest.spyOn(fixture.componentInstance.errorDialog(), "open")

        expect(fixture.componentInstance.showDialog()).toBe(false)

        const printButton = screen.getByRole("button")
        printButton.click()

        expect(fixture.componentInstance.showDialog()).toBe(true)
        expect(errorDialogOpenSpy).not.toHaveBeenCalled()
    })

    it("should open the error dialog when color mode is not absolute", async function () {
        const state = { getValue: jest.fn(() => ({ dynamicSettings: { colorMode: "relative" } })) }
        const store = { select: jest.fn(() => of(ColorMode.weightedGradient)), dispatch: jest.fn() }

        const { fixture } = await render(Export3DMapButtonComponent, {
            excludeComponentDeclaration: true,
            componentImports,
            providers: [
                { provide: State, useValue: state },
                { provide: Store, useValue: store }
            ]
        })

        const errorDialogData = fixture.componentInstance.buildErrorDialog()
        const mockedBuildErrorDialog = jest.spyOn(fixture.componentInstance, "buildErrorDialog").mockReturnValue(errorDialogData)
        const errorDialogOpenSpy = jest.spyOn(fixture.componentInstance.errorDialog(), "open")

        const printButton = screen.getByRole("button")
        printButton.click()

        expect(mockedBuildErrorDialog).toHaveBeenCalledTimes(1)
        expect(errorDialogOpenSpy).toHaveBeenCalledTimes(1)
        expect(errorDialogOpenSpy).toHaveBeenCalledWith(errorDialogData)
    })

    it("should switch to absolute color mode and set showDialog to true when user changes color mode directly", async function () {
        const state = { getValue: () => ({ dynamicSettings: { colorMode: "relative" } }) }
        const store = { dispatch: jest.fn(), select: jest.fn(() => of(ColorMode.absolute)) }

        const { fixture } = await render(Export3DMapButtonComponent, {
            excludeComponentDeclaration: true,
            componentImports,
            providers: [
                { provide: State, useValue: state },
                { provide: Store, useValue: store }
            ]
        })

        const errorDialogData = fixture.componentInstance.buildErrorDialog()

        jest.useFakeTimers()
        errorDialogData.resolveErrorData.onResolveErrorClick()
        jest.runAllTimers()

        expect(store.dispatch).toHaveBeenCalledWith(setColorMode({ value: ColorMode.absolute }))
        expect(fixture.componentInstance.showDialog()).toBe(true)
    })
})
