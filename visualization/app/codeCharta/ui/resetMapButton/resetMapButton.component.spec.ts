import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed"
import { TestBed } from "@angular/core/testing"
import { MatDialogHarness } from "@angular/material/dialog/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { AddCustomConfigButtonModule } from "../customConfigs/addCustomConfigButton/addCustomConfigButton.module"
import { ResetMapButtonComponent } from "./resetMapButton.component"

describe("ResetMapButtonComponent", () => {
    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [AddCustomConfigButtonModule]
        })
    })

    it("should let a user save a custom config", async () => {
        const { fixture } = await render(ResetMapButtonComponent, { excludeComponentDeclaration: true })
        const loader = TestbedHarnessEnvironment.documentRootLoader(fixture)
        let currentlyOpenedDialogs = await loader.getAllHarnesses(MatDialogHarness)
        expect(currentlyOpenedDialogs.length).toBe(0)

        await userEvent.click(screen.getByTitle("Reset map to default"))
        currentlyOpenedDialogs = await loader.getAllHarnesses(MatDialogHarness)
        expect(currentlyOpenedDialogs.length).toBe(1)
    })
})
