import { TestBed } from "@angular/core/testing"
import { State, Store } from "@ngrx/store"
import { Export3DMapButtonComponent } from "./export3DMapButton.component"
import { render, screen } from "@testing-library/angular"
import { MatDialog } from "@angular/material/dialog"
import { ErrorDialogComponent } from "../../../../ui/dialogs/errorDialog/errorDialog.component"
import { setColorMode } from "../../../../state/store/dynamicSettings/colorMode/colorMode.actions"
import { ColorMode } from "../../../../codeCharta.model"
import { of } from "rxjs"

describe("Export3DMapButtonComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [Export3DMapButtonComponent],
            providers: [
                { provide: State, useValue: {} },
                { provide: Store, useValue: {} }
            ]
        })
    })

    it("should render the button", async function () {
        await render(Export3DMapButtonComponent)
        const exportButton = screen.getByRole("button")
        expect(exportButton).not.toBe(null)
    })

    it("should set showDialog to true when button is clicked with color mode absolute", async function () {
        const state = { getValue: () => ({ dynamicSettings: { colorMode: "absolute" } }) }
        const dialog = { open: jest.fn() }

        const { fixture } = await render(Export3DMapButtonComponent, {
            excludeComponentDeclaration: true,
            providers: [
                { provide: State, useValue: state },
                { provide: MatDialog, useValue: dialog }
            ]
        })

        expect(fixture.componentInstance.showDialog()).toBe(false)

        const printButton = screen.getByRole("button")
        printButton.click()

        expect(fixture.componentInstance.showDialog()).toBe(true)
        expect(dialog.open).not.toHaveBeenCalled()
    })

    it("should open the error dialog when color mode is not absolute", async function () {
        const state = { getValue: jest.fn(() => ({ dynamicSettings: { colorMode: "relative" } })) }
        const dialog = { open: jest.fn() }

        const { fixture } = await render(Export3DMapButtonComponent, {
            excludeComponentDeclaration: true,
            providers: [
                { provide: State, useValue: state },
                { provide: MatDialog, useValue: dialog }
            ]
        })

        const errorDialogData = fixture.componentInstance.buildErrorDialog()
        const mockedBuildErrorDialog = jest.spyOn(fixture.componentInstance, "buildErrorDialog").mockReturnValue(errorDialogData)

        const printButton = screen.getByRole("button")
        printButton.click()

        expect(mockedBuildErrorDialog).toHaveBeenCalledTimes(1)
        expect(dialog.open).toHaveBeenCalledTimes(1)
        expect(dialog.open).toHaveBeenCalledWith(ErrorDialogComponent, { data: errorDialogData })
    })

    it("should switch to absolute color mode and set showDialog to true when user changes color mode directly", async function () {
        const state = { getValue: () => ({ dynamicSettings: { colorMode: "relative" } }) }
        const store = { dispatch: jest.fn(), select: jest.fn(() => of(ColorMode.absolute)) }
        const dialog = { open: jest.fn() }

        const { fixture } = await render(Export3DMapButtonComponent, {
            excludeComponentDeclaration: true,
            providers: [
                { provide: State, useValue: state },
                { provide: Store, useValue: store },
                { provide: MatDialog, useValue: dialog }
            ]
        })

        const errorDialogData = fixture.componentInstance.buildErrorDialog()
        dialog.open(ErrorDialogComponent, { data: errorDialogData })

        jest.useFakeTimers()
        errorDialogData.resolveErrorData.onResolveErrorClick()
        jest.runAllTimers()

        expect(store.dispatch).toHaveBeenCalledWith(setColorMode({ value: ColorMode.absolute }))
        expect(fixture.componentInstance.showDialog()).toBe(true)
    })
})
