import { TestBed } from "@angular/core/testing"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"
import { render } from "@testing-library/angular"
import { IncompatibleMapsDialogComponent } from "./incompatibleMapsDialog.component"
import userEvent from "@testing-library/user-event"

describe(IncompatibleMapsDialogComponent.name, () => {
    const mockedMatDialogData = {
        referenceFileName: "file_A.cc.json",
        comparisonFileName: "file_B.cc.json",
        fileWithMccMetric: "file_A.cc.json"
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [IncompatibleMapsDialogComponent],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: mockedMatDialogData
                }
            ]
        })
    })

    it("should display the data correctly", async () => {
        const { container } = await render(IncompatibleMapsDialogComponent)
        const paragraphs = container.querySelectorAll("p")
        expect(paragraphs[1].textContent.trim()).toEqual(
            `${mockedMatDialogData.referenceFileName} → ${mockedMatDialogData.comparisonFileName}`
        )
        expect(paragraphs[2].textContent.trim()).toEqual(
            `The file ${mockedMatDialogData.fileWithMccMetric} is using the mcc metric and the other one complexity. Please migrate.`
        )
    })

    it("should call setDoNotAlertOnIncompatibleMaps() when clicking on the checkbox", async () => {
        const { container, fixture } = await render(IncompatibleMapsDialogComponent)
        const componentInstance = fixture.componentInstance
        const spySetDoNotAlertOnIncompatibleMaps = jest.spyOn(componentInstance, "setDoNotAlertOnIncompatibleMaps")

        const checkbox = container.querySelector("mat-checkbox input")
        await userEvent.click(checkbox)
        fixture.detectChanges()

        expect(spySetDoNotAlertOnIncompatibleMaps).toHaveBeenCalled()
    })

    it("should update localStorage when setDoNotAlertOnIncompatibleMaps() is called", async () => {
        const { container, fixture } = await render(IncompatibleMapsDialogComponent)

        const checkbox = container.querySelector("mat-checkbox input")
        await userEvent.click(checkbox)
        fixture.detectChanges()
        expect(localStorage.getItem("alertOnIncompatibleMaps")).toBe(JSON.stringify(false))

        await userEvent.click(checkbox)
        fixture.detectChanges()
        expect(localStorage.getItem("alertOnIncompatibleMaps")).toBe(JSON.stringify(true))
    })
})
