import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { EdgeSettingsPanelComponent } from "./edgeSettingsPanel.component"
import { Store, StoreModule } from "@ngrx/store"
import userEvent from "@testing-library/user-event"
import { setState } from "../../../state/store/state.actions"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"

describe("EdgeSettingsPanelComponent", () => {
    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [EdgeSettingsPanelComponent, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })

        await render(EdgeSettingsPanelComponent)
    })

    it("should render correctly", () => {
        expect(screen.getByText("Preview")).toBeTruthy()
        expect(screen.getByText("Height")).toBeTruthy()
        expect(screen.getByText("Outgoing Edge")).toBeTruthy()
        expect(screen.getByText("Incoming Edge")).toBeTruthy()
        expect(screen.getAllByText("Show")).toHaveLength(2)
        expect(screen.getAllByRole("checkbox", { name: "Show", checked: true })).toHaveLength(2)
        expect(screen.getByText("Only show nodes with edges")).toBeTruthy()
        expect(screen.getByTitle("Reset edge metric settings to their defaults")).toBeTruthy()
    })

    it("should dispatch all possible settings when reset button is clicked", async () => {
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")
        const resetSettingsButton = screen.getByTitle("Reset edge metric settings to their defaults")
        const defaultSettings = {
            appSettings: {
                amountOfEdgePreviews: 1,
                edgeHeight: 4,
                mapColors: {
                    outgoingEdge: "#ff00ff",
                    incomingEdge: "#00ffff"
                },
                showOutgoingEdges: true,
                showIncomingEdges: true,
                showOnlyBuildingsWithEdges: false,
                isEdgeMetricVisible: true
            }
        }

        await userEvent.click(resetSettingsButton)

        expect(dispatchSpy).toHaveBeenCalledWith(setState({ value: defaultSettings }))
    })
})
