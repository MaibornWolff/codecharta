import { TestBed } from "@angular/core/testing"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"
import { render } from "@testing-library/angular"
import { IncompatibleMapsDialogComponent } from "./incompatibleMapsDialog.component"
import { IncompatibleMapsDialogModule } from "./incompatibleMapsDialog.module"
import userEvent from "@testing-library/user-event"
import { MatCheckboxModule } from "@angular/material/checkbox"

describe(IncompatibleMapsDialogComponent.name, () => {
    const mockedMatDialogData = {
        referenceFileName: "file_A.cc.json",
        comparisonFileName: "file_B.cc.json",
        fileWithMccMetric: "file_A.cc.json"
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [IncompatibleMapsDialogModule, MatCheckboxModule],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: mockedMatDialogData
                }
            ]
        })
    })

    it("should display the data correctly", async () => {
        const { container } = await render(IncompatibleMapsDialogComponent, { excludeComponentDeclaration: true })
        const paragraphs = container.querySelectorAll("p")
        expect(paragraphs[1].textContent.trim()).toEqual(
            `${mockedMatDialogData.referenceFileName} → ${mockedMatDialogData.comparisonFileName}`
        )
        expect(paragraphs[2].textContent.trim()).toEqual(
            `The file ${mockedMatDialogData.fileWithMccMetric} is using the mcc metric and the other one complexity. Please migrate.`
        )
    })

    it("should call setDoNotAlertOnIncompatibleMaps() when clicking on the checkbox", async () => {
        const { container, fixture } = await render(IncompatibleMapsDialogComponent, { excludeComponentDeclaration: true })
        const componentInstance = fixture.componentInstance
        const spySetDoNotAlertOnIncompatibleMaps = jest.spyOn(componentInstance, "setDoNotAlertOnIncompatibleMaps")

        const checkbox = container.querySelector("mat-checkbox input")
        await userEvent.click(checkbox)
        fixture.detectChanges()

        expect(spySetDoNotAlertOnIncompatibleMaps).toHaveBeenCalled()
    })

    it("should update localStorage when setDoNotAlertOnIncompatibleMaps() is called", async () => {
        const { container, fixture } = await render(IncompatibleMapsDialogComponent, { excludeComponentDeclaration: true })

        const checkbox = container.querySelector("mat-checkbox input")
        await userEvent.click(checkbox)
        fixture.detectChanges()
        expect(localStorage.getItem("alertOnIncompatibleMaps")).toBe(JSON.stringify(false))

        await userEvent.click(checkbox)
        fixture.detectChanges()
        expect(localStorage.getItem("alertOnIncompatibleMaps")).toBe(JSON.stringify(true))
    })
})
