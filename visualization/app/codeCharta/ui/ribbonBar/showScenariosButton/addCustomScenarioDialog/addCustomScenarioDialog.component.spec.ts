import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed"
import { TestBed } from "@angular/core/testing"
import { MatButtonHarness } from "@angular/material/button/testing"
import { MatDialogRef } from "@angular/material/dialog"
import { MatInputHarness } from "@angular/material/input/testing"
import { State, Store, StoreModule } from "@ngrx/store"
import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { Vector3 } from "three"
import { setState } from "../../../../state/store/state.actions"
import { appReducers, setStateMiddleware } from "../../../../state/store/state.manager"
import { SCENARIO_ATTRIBUTE_CONTENT, STATE } from "../../../../util/dataMocks"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../../codeMap/threeViewer/threeOrbitControls.service"
import { ScenarioHelper } from "../scenarioHelper"
import { AddCustomScenarioDialogComponent } from "./addCustomScenarioDialog.component"
import { AddCustomScenarioDialogModule } from "./addCustomScenarioDialog.module"

describe("AddCustomScenarioComponent", () => {
    beforeEach(async () => {
        return TestBed.configureTestingModule({
            imports: [AddCustomScenarioDialogModule, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })],
            providers: [
                { provide: ThreeCameraService, useValue: { camera: { position: new Vector3(0, 300, 1000) } } },
                { provide: ThreeOrbitControlsService, useValue: { controls: { target: new Vector3(177, 0, 299) } } },
                { provide: MatDialogRef, useValue: { close: jest.fn() } },
                { provide: State, useValue: { getValue: () => STATE } }
            ]
        }).compileComponents()
    })

    it("should enable the user to add a custom scenario, with all properties set initially", async () => {
        ScenarioHelper.addScenario = jest.fn()
        const { fixture } = await render(AddCustomScenarioDialogComponent, { excludeComponentDeclaration: true })
        const loader = TestbedHarnessEnvironment.loader(fixture)

        const closeDialog = TestBed.inject(MatDialogRef).close
        const nameInput = await loader.getHarness(MatInputHarness)
        const createButton = await loader.getHarness(MatButtonHarness.with({ text: "ADD" }))

        await nameInput.setValue("my-custom-scenario")
        await createButton.click()

        expect(ScenarioHelper.addScenario).toHaveBeenCalled()
        expect((ScenarioHelper.addScenario as jest.Mock).mock.calls[0][0]).toBe("my-custom-scenario")
        expect((ScenarioHelper.addScenario as jest.Mock).mock.calls[0][1]).toEqual(SCENARIO_ATTRIBUTE_CONTENT)
        expect(closeDialog).toHaveBeenCalled()
    })

    it("should validate scenario's name", async () => {
        ScenarioHelper.isScenarioExisting = (name: string) => name === "I-already-exist"
        const { container } = await render(AddCustomScenarioDialogComponent, { excludeComponentDeclaration: true })

        const scenarioNameInput = container.querySelector("input")
        await userEvent.click(scenarioNameInput)
        scenarioNameInput.blur()
        expect(await screen.findByText("Scenario name is required")).toBeTruthy()

        await userEvent.type(scenarioNameInput, "I-already-exist")
        expect(await screen.findByText("A Scenario with this name already exists")).toBeTruthy()

        await userEvent.type(scenarioNameInput, "my-custom-scenario")
        await waitFor(() => expect(screen.queryByText("A Scenario with this name already exists")).toBeFalsy())
    })

    it("should show an error message, when no properties are selected", async () => {
        const { detectChanges } = await render(AddCustomScenarioDialogComponent, { excludeComponentDeclaration: true })
        const store = TestBed.inject(Store)
        store.dispatch(setState({ value: STATE }))
        detectChanges()

        await userEvent.click(screen.getByText("Camera-Position"))
        await userEvent.click(screen.getByText("Area-Metric (rloc)"))
        await userEvent.click(screen.getByText("Height-Metric (mcc)"))
        await userEvent.click(screen.getByText("Color-Metric (mcc)"))
        await userEvent.click(screen.getByText("Edge-Metric (pairingRate)"))
        expect(await screen.findByText("You cannot create an empty Scenario")).toBeTruthy()
    })
})
