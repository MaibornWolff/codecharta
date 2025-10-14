import { HttpClient } from "@angular/common/http"
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed"
import { TestBed } from "@angular/core/testing"
import { MatDialogHarness } from "@angular/material/dialog/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { LoadFileService } from "../../services/loadFile/loadFile.service"
import { LoadInitialFileService } from "../../services/loadInitialFile/loadInitialFile.service"
import { AddCustomConfigButtonComponent } from "../customConfigs/addCustomConfigButton/addCustomConfigButton.component"
import { ResetMapButtonComponent } from "./resetMapButton.component"

describe("ResetMapButtonComponent", () => {
    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [AddCustomConfigButtonComponent],
            providers: [
                provideMockStore(),
                { provide: HttpClient, useValue: {} },
                { provide: LoadFileService, useValue: { loadFiles: jest.fn() } },
                {
                    provide: LoadInitialFileService,
                    useValue: { setRenderStateFromUrl: jest.fn(), checkFileQueryParameterPresent: jest.fn(() => false) }
                }
            ]
        })
    })

    it("should let a user save a custom config", async () => {
        const { fixture } = await render(ResetMapButtonComponent)
        const loader = TestbedHarnessEnvironment.documentRootLoader(fixture)
        let currentlyOpenedDialogs = await loader.getAllHarnesses(MatDialogHarness)
        expect(currentlyOpenedDialogs.length).toBe(0)

        await userEvent.click(screen.getByTitle("Reset map to default"))
        currentlyOpenedDialogs = await loader.getAllHarnesses(MatDialogHarness)
        expect(currentlyOpenedDialogs.length).toBe(1)
    })
})
