import { TestBed } from "@angular/core/testing"
import { expect } from "@jest/globals"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { firstValueFrom, of } from "rxjs"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { isEdgeMetricVisibleSelector } from "../../../state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.selector"
import { setEdgeMetric } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { edgeMetricSelector } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { VALID_NODES_WITH_ID } from "../../../util/dataMocks"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { NodeSelectionService } from "../../metricChooser/nodeSelection.service"
import { EdgeMetricChooserComponent } from "./edgeMetricChooser.component"
import { EdgeMetricChooserModule } from "./edgeMetricChooser.module"

describe("edgeMetricChooserComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [EdgeMetricChooserModule],
			providers: [
				{ provide: NodeSelectionService, useValue: { createNodeObservable: () => of(VALID_NODES_WITH_ID) } },
				provideMockStore({
					selectors: [
						{
							selector: metricDataSelector,
							value: {
								edgeMetricData: [
									{ name: "aMetric", maxValue: 1 },
									{ name: "bMetric", maxValue: 2 }
								]
							}
						},
						{ selector: edgeMetricSelector, value: "aMetric" },
						{ selector: isEdgeMetricVisibleSelector, value: true },
						{ selector: attributeDescriptorsSelector, value: {} }
					]
				})
			]
		})
	})

	describe("edgeMetricChooser", () => {
		it("should be a select for edge metric", async () => {
			const { detectChanges } = await render(EdgeMetricChooserComponent, { excludeComponentDeclaration: true })

			await userEvent.click(await screen.findByText("aMetric"))
			expect(screen.getByPlaceholderText("Edge Metric (highest value)")).not.toBe(null)
			const options = screen.queryAllByRole("option")
			expect(options[0].textContent).toMatch("aMetric (1)")
			expect(options[1].textContent).toMatch("bMetric (2)")

			const store = TestBed.inject(MockStore)
			await userEvent.click(options[1])
			expect(await getLastAction(store)).toEqual(setEdgeMetric({ value: "bMetric" }))
			store.overrideSelector(edgeMetricSelector, "bMetric")
			store.refreshState()
			detectChanges()

			expect(screen.queryByText("aMetric")).toBe(null)
			expect(screen.queryByText("bMetric")).not.toBe(null)
		})

		it("should reflect edge metric's visibility in its class name", async () => {
			const { container, detectChanges } = await render(EdgeMetricChooserComponent, { excludeComponentDeclaration: true })

			let metricChoser = container.querySelector("cc-metric-chooser")
			expect(metricChoser.classList.contains("is-edge-metric-disabled")).toBe(false)
			const store = TestBed.inject(MockStore)
			store.overrideSelector(isEdgeMetricVisibleSelector, false)
			store.refreshState()
			detectChanges()

			metricChoser = container.querySelector("cc-metric-chooser")
			expect(metricChoser.classList.contains("is-edge-metric-disabled")).toBe(true)
		})
	})

	describe("edgeValue", () => {
		it("should return null when there is no node hovered", async () => {
			TestBed.overrideProvider(NodeSelectionService, {
				useValue: { createNodeObservable: jest.fn().mockReturnValue(of(null)) }
			})

			const { fixture } = await render(EdgeMetricChooserComponent, { excludeComponentDeclaration: true })
			const edgeValue = await firstValueFrom(fixture.componentInstance.edgeValue$)
			expect(edgeValue).toBe(null)
		})

		it("should return null if node has no edge attributes for given metric", async () => {
			const { fixture } = await render(EdgeMetricChooserComponent, { excludeComponentDeclaration: true })
			const edgeValue = await firstValueFrom(fixture.componentInstance.edgeValue$)
			expect(edgeValue).toBe(null)
		})

		it("should format edge values to locale string", async () => {
			TestBed.overrideProvider(NodeSelectionService, {
				useValue: {
					createNodeObservable: jest
						.fn()
						.mockReturnValue(of({ edgeAttributes: { aMetric: { incoming: 3.141_59, outgoing: 2 } } }))
				}
			})

			const { fixture } = await render(EdgeMetricChooserComponent, { excludeComponentDeclaration: true })
			const edgeValue = await firstValueFrom(fixture.componentInstance.edgeValue$)
			expect(edgeValue).toBe("3.142 / 2")
		})

		it("should format not existing values to '-'", async () => {
			TestBed.overrideProvider(NodeSelectionService, {
				useValue: {
					createNodeObservable: jest
						.fn()
						.mockReturnValue(of({ edgeAttributes: { aMetric: { incoming: undefined, outgoing: 2 } } }))
				}
			})

			const { fixture } = await render(EdgeMetricChooserComponent, { excludeComponentDeclaration: true })
			const edgeValue = await firstValueFrom(fixture.componentInstance.edgeValue$)
			expect(edgeValue).toBe("- / 2")
		})
	})
})
