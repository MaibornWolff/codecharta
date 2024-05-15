import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed"
import { TestBed } from "@angular/core/testing"
import { MatInputHarness } from "@angular/material/input/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { AreaSettingsPanelComponent } from "./areaSettingsPanel.component"
import { AreaSettingsPanelModule } from "./areaSettingsPanel.module"
import { State, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"
import { CcState } from "../../../codeCharta.model"

describe("AreaSettingsPanelComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AreaSettingsPanelModule, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
    })

    it("should allow for change and resetting of 'margin', 'enable floor label' and 'invert area'", async () => {
        const { fixture } = await render(AreaSettingsPanelComponent, { excludeComponentDeclaration: true })
        const loader = TestbedHarnessEnvironment.loader(fixture)
        const state = TestBed.inject(State)
        const initialValues = extractRelatedValues(state.getValue())

        const marginInput = await loader.getHarness(MatInputHarness.with({ ancestor: 'cc-slider[label="Margin"]' }))
        await marginInput.setValue(String(initialValues.margin + 1))
        await userEvent.click(await screen.findByText("Enable Floor Labels"))
        await userEvent.click(await screen.findByText("Invert Area"))
        const changedValues = extractRelatedValues(state.getValue())
        expect(changedValues.margin).toBe(initialValues.margin + 1)
        expect(changedValues.enableFloorLabels).toBe(!initialValues.enableFloorLabels)
        expect(changedValues.invertArea).toBe(!initialValues.invertArea)

        await userEvent.click(await screen.findByText("Reset area metric settings"))
        const resetValues = extractRelatedValues(state.getValue())
        expect(resetValues).toEqual(initialValues)
    })

    function extractRelatedValues(state: CcState) {
        return {
            margin: state.dynamicSettings.margin,
            enableFloorLabels: state.appSettings.enableFloorLabels,
            invertArea: state.appSettings.invertArea
        }
    }
})
