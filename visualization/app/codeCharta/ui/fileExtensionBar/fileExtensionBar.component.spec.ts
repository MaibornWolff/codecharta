import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { CODE_MAP_BUILDING_TS_NODE } from "../../util/dataMocks"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { FileExtensionBarComponent } from "./fileExtensionBar.component"
import { FileExtensionBarModule } from "./fileExtensionBar.module"
import { metricDistributionSelector } from "./selectors/metricDistribution.selector"
import { distributionMetricSelector } from "../../state/store/dynamicSettings/distributionMetric/distributionMetric.selector"
import { defaultDistributionMetric } from "../../state/store/dynamicSettings/distributionMetric/distributionMetric.reducer"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"

describe("fileExtensionBarComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [FileExtensionBarModule],
			providers: [
				{
					provide: ThreeSceneService,
					useValue: {
						getMapMesh: jest.fn().mockReturnValue({
							getMeshDescription: jest.fn().mockReturnValue({
								buildings: [CODE_MAP_BUILDING_TS_NODE]
							})
						}),
						addBuildingToHighlightingList: jest.fn(),
						highlightBuildings: jest.fn()
					}
				},
				provideMockStore({
					selectors: [
						{
							selector: metricDistributionSelector,
							value: [
								{
									fileExtension: "ts",
									absoluteMetricValue: 1120,
									relativeMetricValue: 100,
									color: "hsl(111, 40%, 50%)"
								}
							]
						},
						{ selector: distributionMetricSelector, value: defaultDistributionMetric },
						{ selector: metricDataSelector, value: { nodeMetricData: [] } }
					]
				})
			]
		})
	})

	it("should toggle displayed metric relative / absolute values on click", async () => {
		await render(FileExtensionBarComponent, { excludeComponentDeclaration: true })
		expect(screen.getByText("ts 100.00%")).toBeTruthy()
		expect(screen.queryByText("ts 1,120")).toBe(null)

		await userEvent.click(screen.getByText("ts 100.00%"))
		expect(screen.queryByText("ts 100%")).toBe(null)
		expect(screen.getByText("ts 1,120")).toBeTruthy()
	})

	it("should show details on click of details button", async () => {
		const { container } = await render(FileExtensionBarComponent, { excludeComponentDeclaration: true })
		expect(container.querySelector(".cc-distribution-details").classList).toContain("cc-hidden")

		await userEvent.click(container.querySelector(".cc-show-details-button"))
		expect(container.querySelector(".cc-distribution-details").classList).not.toContain("cc-hidden")
	})

	it("should highlight buildings on hover", async () => {
		await render(FileExtensionBarComponent, { excludeComponentDeclaration: true })
		await userEvent.hover(screen.getByText("ts 100.00%"))

		const threeSceneService = TestBed.inject<ThreeSceneService>(ThreeSceneService)
		expect(threeSceneService.addBuildingToHighlightingList).toHaveBeenCalledWith(CODE_MAP_BUILDING_TS_NODE)
		expect(threeSceneService.highlightBuildings).toHaveBeenCalled()
	})
})
