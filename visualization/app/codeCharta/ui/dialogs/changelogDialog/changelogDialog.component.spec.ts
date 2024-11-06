import { TestBed } from "@angular/core/testing"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"
import { render, screen } from "@testing-library/angular"
import { ChangelogDialogComponent } from "./changelogDialog.component"

// note that CHANGELOG.md is mocked globally through jest's moduleNameMapper
describe("ChangelogDialogComponent", () => {
    const mockedMatDialogData = { previousVersion: "", currentVersion: "" }
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ChangelogDialogComponent],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: mockedMatDialogData
                }
            ]
        })
    })

    it("should extract the changes from changelog only for the last version", async () => {
        mockedMatDialogData.previousVersion = "1.76.0"
        mockedMatDialogData.currentVersion = "1.77.0"
        await render(ChangelogDialogComponent)

        expect(screen.findByText("1.76.0 → 1.77.0")).toBeTruthy()

        expect(screen.findByText("Chore 👨‍💻 👩‍💻")).toBeTruthy()
        expect(screen.findByText("#6")).toBeTruthy()

        expect(screen.findByText("Fixed 🐞")).toBeTruthy()
        expect(screen.findByText("#3")).toBeTruthy()
        expect(screen.findByText("#4")).toBeTruthy()
        expect(screen.findByText("#5")).toBeTruthy()
    })

    it("should extract the changes from changelog for 2 versions", async () => {
        mockedMatDialogData.previousVersion = "1.75.0"
        mockedMatDialogData.currentVersion = "1.77.0"
        await render(ChangelogDialogComponent)

        expect(screen.findByText("1.75.0 → 1.77.0")).toBeTruthy()

        expect(screen.findByText("Chore 👨‍💻 👩‍💻")).toBeTruthy()
        expect(screen.findByText("#6")).toBeTruthy()

        expect(screen.findByText("Fixed 🐞")).toBeTruthy()
        expect(screen.findByText("#3")).toBeTruthy()
        expect(screen.findByText("#4")).toBeTruthy()
        expect(screen.findByText("#5")).toBeTruthy()

        expect(screen.findByText("Added 🚀")).toBeTruthy()
        expect(screen.findByText("#7")).toBeTruthy()
        expect(screen.findByText("#8")).toBeTruthy()

        expect(screen.findByText("Changed")).toBeTruthy()
        expect(screen.findByText("#9")).toBeTruthy()
        expect(screen.findByText("#10")).toBeTruthy()

        expect(screen.queryByText("Removed 🗑")).toBeFalsy()
    })
})
