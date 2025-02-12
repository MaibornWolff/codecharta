import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { EdgeSettingsPanelComponent } from "./edgeSettingsPanel.component"
import { provideMockStore } from "@ngrx/store/testing"
import { amountOfBuildingsWithSelectedEdgeMetricSelector } from "../../../state/selectors/amountOfBuildingsWithSelectedEdgeMetric.selector"
import { amountOfEdgePreviewsSelector } from "../../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.selector"
import { edgeHeightSelector } from "../../../state/store/appSettings/edgeHeight/edgeHeight.selector"
import { showOnlyBuildingsWithEdgesSelector } from "../../../state/store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.selector"
import { State } from "@ngrx/store"
import { colorMetricSelector } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { colorRangeSelector } from "../../../state/store/dynamicSettings/colorRange/colorRange.selector"
import { mapColorsSelector } from "../../../state/store/appSettings/mapColors/mapColors.selector"
import { defaultMapColors } from "../../../state/store/appSettings/mapColors/mapColors.reducer"
import { showIncomingEdgesSelector } from "../../../state/store/appSettings/showEdges/incoming/showIncomingEdges.selector"
import { defaultShowIncomingEdges } from "../../../state/store/appSettings/showEdges/incoming/showIncomingEdges.reducer"
import { defaultShowOutgoingEdges } from "../../../state/store/appSettings/showEdges/outgoing/showOutgoingEdges.reducer"
import { showOutgoingEdgesSelector } from "../../../state/store/appSettings/showEdges/outgoing/showOutgoingEdges.selector"

describe("EdgeSettingsPanelComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [EdgeSettingsPanelComponent],
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: amountOfBuildingsWithSelectedEdgeMetricSelector, value: 10 },
                        { selector: amountOfEdgePreviewsSelector, value: 10 },
                        { selector: edgeHeightSelector, value: 10 },
                        { selector: showOnlyBuildingsWithEdgesSelector, value: true },
                        { selector: colorMetricSelector, value: "rloc" },
                        { selector: colorRangeSelector, value: { from: 21, to: 42, max: 9001 } },
                        { selector: mapColorsSelector, value: defaultMapColors },
                        { selector: showIncomingEdgesSelector, value: defaultShowIncomingEdges },
                        { selector: showOutgoingEdgesSelector, value: defaultShowOutgoingEdges }
                    ]
                }),
                { provide: State, useValue: {} }
            ]
        })
    })

    it("should render correctly", async () => {
        await render(EdgeSettingsPanelComponent)
        expect(screen.getByText("Preview")).toBeTruthy()
        expect(screen.getByText("Height")).toBeTruthy()
        expect(screen.getByText("Outgoing Edge")).toBeTruthy()
        expect(screen.getByText("Incoming Edge")).toBeTruthy()
        expect(screen.getAllByText("Show")).toHaveLength(2)
        expect(screen.getAllByRole("checkbox", { name: "Show", checked: true })).toHaveLength(2)
        expect(screen.getByText("Only show nodes with edges")).toBeTruthy()
        expect(screen.getByTitle("Reset edge metric settings to their defaults")).toBeTruthy()
    })
})
