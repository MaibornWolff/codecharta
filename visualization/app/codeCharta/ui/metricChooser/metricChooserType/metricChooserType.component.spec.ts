import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { Observable, of } from "rxjs"
import { DIFFERENT_NODE } from "../../../util/dataMocks"
import { NodeSelectionService } from "../nodeSelection.service"
import { MetricChooserTypeComponent } from "./metricChooserType.component"

describe("metricChooserTypeComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: NodeSelectionService, useValue: { createNodeObservable: jest.fn(() => new Observable(null)) } },
				provideMockStore()
			]
		})
	})
	it("should not be hidden, when hovered node is a folder", async () => {
		const { container } = await render(MetricChooserTypeComponent)

		expect(container.querySelector("span").hidden).toBe(false)
	})

	it("should be hidden, when hovered node is a leaf", async () => {
		TestBed.overrideProvider(NodeSelectionService, {
			useValue: { createNodeObservable: jest.fn().mockReturnValue(of(DIFFERENT_NODE)) }
		})
		const { container } = await render(MetricChooserTypeComponent)

		expect(container.querySelector("span").hidden).toBe(true)
	})
})
