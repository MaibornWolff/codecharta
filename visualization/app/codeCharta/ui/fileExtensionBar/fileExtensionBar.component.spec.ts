import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ThreeSceneServiceToken } from "../../services/ajs-upgraded-providers"
import { CODE_MAP_BUILDING_TS_NODE } from "../../util/dataMocks"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { FileExtensionBarComponent } from "./fileExtensionBar.component"
import { FileExtensionBarModule } from "./fileExtensionBar.module"

jest.mock("../../state/angular-redux/onStoreChanged/onStoreChanged", () => ({
	onStoreChanged: (_, callback) =>
		callback(null, [
			{
				fileExtension: "ts",
				absoluteMetricValue: 20,
				relativeMetricValue: 100,
				color: "hsl(111, 40%, 50%)"
			}
		])
}))

describe("fileExtensionBarComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [FileExtensionBarModule],
			providers: [
				{
					provide: ThreeSceneServiceToken,
					useValue: {
						getMapMesh: jest.fn().mockReturnValue({
							getMeshDescription: jest.fn().mockReturnValue({
								buildings: [CODE_MAP_BUILDING_TS_NODE]
							})
						}),
						addBuildingToHighlightingList: jest.fn(),
						highlightBuildings: jest.fn()
					}
				}
			]
		})
	})

	it("should toggle displayed metric relative / absolute values on click", async () => {
		await render(FileExtensionBarComponent, { excludeComponentDeclaration: true })
		expect(screen.getByText("ts 100.00%")).toBeTruthy()
		expect(screen.queryByText("ts 20")).toBe(null)

		userEvent.click(screen.getByText("ts 100.00%"))
		expect(screen.queryByText("ts 100%")).toBe(null)
		expect(screen.getByText("ts 20")).toBeTruthy()
	})

	it("should show details on click of details button", async () => {
		const { container } = await render(FileExtensionBarComponent, { excludeComponentDeclaration: true })
		expect(container.querySelector(".cc-distribution-details").classList).toContain("cc-hidden")

		userEvent.click(container.querySelector(".cc-show-details-button"))
		expect(container.querySelector(".cc-distribution-details").classList).not.toContain("cc-hidden")
	})

	it("should highlight buildings on hover", async () => {
		await render(FileExtensionBarComponent, { excludeComponentDeclaration: true })
		userEvent.hover(screen.getByText("ts 100.00%"))

		const threeSceneService = TestBed.inject<ThreeSceneService>(ThreeSceneServiceToken)
		expect(threeSceneService.addBuildingToHighlightingList).toHaveBeenCalledWith(CODE_MAP_BUILDING_TS_NODE)
		expect(threeSceneService.highlightBuildings).toHaveBeenCalled()
	})
})
