import { TestBed } from "@angular/core/testing"
import { StoreModule } from "@ngrx/store"
import { render, screen } from "@testing-library/angular"
import { EdgeMetricData } from "../../codeCharta.model"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
import { appReducers, setStateMiddleware } from "../../state/store/state.manager"
import { VALID_NODE_WITH_PATH_AND_EXTENSION } from "../../util/dataMocks"
import { CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { RibbonBarComponent } from "./ribbonBar.component"
import { RibbonBarModule } from "./ribbonBar.module"

jest.mock("../../state/selectors/isDeltaState.selector", () => ({
    isDeltaStateSelector: jest.fn()
}))
const mockedIsDeltaStateSelector = jest.mocked(isDeltaStateSelector)
jest.mock("../../state/selectors/accumulatedData/metricData/metricData.selector", () => ({
    metricDataSelector: jest.fn()
}))
const mockMetricDataSelector = jest.mocked(metricDataSelector)

jest.mock("../../state/store/dynamicSettings/areaMetric/areaMetric.selector", () => ({
    areaMetricSelector: () => "rloc"
}))

const mockedAccumulatedData = {}
jest.mock("../../state/selectors/accumulatedData/accumulatedData.selector", () => ({
    accumulatedDataSelector: () => mockedAccumulatedData
}))

describe("RibbonBarComponent", () => {
    beforeEach(() => {
        mockedAccumulatedData["unifiedMapNode"] = VALID_NODE_WITH_PATH_AND_EXTENSION
        mockedIsDeltaStateSelector.mockImplementation(() => false)
        mockMetricDataSelector.mockImplementation(() => ({ edgeMetricData: [], nodeMetricData: [], nodeEdgeMetricsMap: new Map() }))
        TestBed.configureTestingModule({
            imports: [RibbonBarModule, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })],
            providers: [{ provide: CodeMapMouseEventService, useValue: jest.fn() }]
        })
    })

    describe("delta state", () => {
        it("should not show cc-color-metric-chooser and cc-link-color-metric-to-height-metric-button when in delta mode", async () => {
            mockedIsDeltaStateSelector.mockImplementation(() => true)
            const { container } = await render(RibbonBarComponent, { excludeComponentDeclaration: true })
            expect(container.querySelector("cc-color-metric-chooser")).toBe(null)
            expect(container.querySelector("cc-link-color-metric-to-height-metric-button")).toBe(null)
        })

        it("should show cc-color-metric-chooser and cc-link-color-metric-to-height-metric-button when not in delta mode", async () => {
            mockedIsDeltaStateSelector.mockImplementation(() => false)
            const { container } = await render(RibbonBarComponent, { excludeComponentDeclaration: true })
            expect(container.querySelector("cc-color-metric-chooser")).not.toBe(null)
            expect(container.querySelector("cc-link-color-metric-to-height-metric-button")).not.toBe(null)
        })

        it("should show cc-color-settings-panel when in delta mode", async () => {
            mockedIsDeltaStateSelector.mockImplementation(() => true)
            const { container } = await render(RibbonBarComponent, { excludeComponentDeclaration: true })
            expect(container.querySelector("cc-color-settings-panel")).not.toBe(null)
        })
    })

    describe("edge metric chooser", () => {
        it("should show edge metrics when there are some available", async () => {
            mockMetricDataSelector.mockImplementation(() => ({
                edgeMetricData: [{} as EdgeMetricData],
                nodeMetricData: [],
                nodeEdgeMetricsMap: new Map()
            }))

            await render(RibbonBarComponent, { excludeComponentDeclaration: true })
            expect(screen.getByText("Edge Metric Options")).toBeTruthy()
        })

        it("should hide edge metrics when there aren't any available", async () => {
            await render(RibbonBarComponent, { excludeComponentDeclaration: true })
            expect(screen.queryByText("Edge Metric Options")).toBe(null)
        })
    })
})
