import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { mocked } from "ts-jest/utils"
import { EdgeMetricData } from "../../codeCharta.model"
import { edgeMetricDataSelector } from "../../state/selectors/accumulatedData/metricData/edgeMetricData.selector"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
import { setExperimentalFeaturesEnabled } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { Store } from "../../state/store/store"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControls.service"
import { RibbonBarComponent } from "./ribbonBar.component"
import { RibbonBarModule } from "./ribbonBar.module"

jest.mock("../../state/selectors/isDeltaState.selector", () => ({
	isDeltaStateSelector: jest.fn()
}))
const mockedIsDeltaStateSelector = mocked(isDeltaStateSelector)
jest.mock("../../state/selectors/accumulatedData/metricData/edgeMetricData.selector", () => ({
	edgeMetricDataSelector: jest.fn(() => [])
}))
const mockEdedgeMetricDataSelector = mocked(edgeMetricDataSelector)

describe("RibbonBarComponent", () => {
	beforeEach(() => {
		mockedIsDeltaStateSelector.mockImplementation(() => false)
		mockEdedgeMetricDataSelector.mockImplementation(() => [])
		TestBed.configureTestingModule({
			imports: [RibbonBarModule],
			providers: [
				{ provide: ThreeCameraService, useValue: {} },
				{ provide: ThreeOrbitControlsService, useValue: {} }
			]
		})
	})

	describe("panel sections", () => {
		it("should toggle panel section", async () => {
			const { container } = await render(RibbonBarComponent, { excludeComponentDeclaration: true })
			expect(container.querySelector("cc-area-settings-panel").classList).toContain("hidden")

			await userEvent.click(screen.getByText("Area Metric Options"))
			expect(container.querySelector("cc-area-settings-panel").classList).not.toContain("hidden")

			await userEvent.click(screen.getByText("Area Metric Options"))
			expect(container.querySelector("cc-area-settings-panel").classList).toContain("hidden")
		})

		it("should close on outside clicks", async () => {
			const { container } = await render(RibbonBarComponent, { excludeComponentDeclaration: true })

			await userEvent.click(screen.getByText("Area Metric Options"))
			expect(container.querySelector("cc-area-settings-panel").classList).not.toContain("hidden")

			await userEvent.click(document.body)
			expect(container.querySelector("cc-area-settings-panel").classList).toContain("hidden")
		})

		it("should detect clicks within panel selections and not close itself", async () => {
			const { fixture } = await render(RibbonBarComponent, { excludeComponentDeclaration: true })
			const mouseEvent = {
				composedPath: () => [{ nodeName: "CC-COLOR-SETTINGS-PANEL" }]
			} as unknown as MouseEvent
			const isClickOutside = fixture.componentInstance["isOutside"](mouseEvent)
			expect(isClickOutside).toBe(false)
		})
	})

	describe("experimental features", () => {
		it("should hide experimental features when they are disabled", async () => {
			Store.dispatch(setExperimentalFeaturesEnabled(false))
			await render(RibbonBarComponent, { excludeComponentDeclaration: true })
			expect(screen.queryByText("Custom Views")).toBe(null)
			expect(screen.queryByText("Suspicious Metrics")).toBe(null)
		})

		it("should show experimental features when they are enabled", async () => {
			Store.dispatch(setExperimentalFeaturesEnabled(true))
			await render(RibbonBarComponent, { excludeComponentDeclaration: true })
			expect(screen.getByText("Custom Views")).toBeTruthy()
			expect(screen.getByText("Suspicious Metrics")).toBeTruthy()
		})
	})

	describe("delta state", () => {
		it("should not show cc-color-metric-chooser when in delta mode", async () => {
			mockedIsDeltaStateSelector.mockImplementation(() => true)
			const { container } = await render(RibbonBarComponent, { excludeComponentDeclaration: true })
			expect(container.querySelector("cc-color-metric-chooser")).toBe(null)
		})

		it("should show cc-color-metric-chooser when not in delta mode", async () => {
			mockedIsDeltaStateSelector.mockImplementation(() => false)
			const { container } = await render(RibbonBarComponent, { excludeComponentDeclaration: true })
			expect(container.querySelector("cc-color-metric-chooser")).not.toBe(null)
		})
	})

	describe("edge metric chooser", () => {
		it("should show edge metrics when there are some available", async () => {
			mockEdedgeMetricDataSelector.mockImplementation(() => [{} as EdgeMetricData])
			await render(RibbonBarComponent, { excludeComponentDeclaration: true })
			expect(screen.getByText("Edge Metric Options")).toBeTruthy()
		})

		it("should hide edge metrics when there aren't any available", async () => {
			mockEdedgeMetricDataSelector.mockImplementation(() => [])
			await render(RibbonBarComponent, { excludeComponentDeclaration: true })
			expect(screen.queryByText("Edge Metric Options")).toBe(null)
		})
	})
})
