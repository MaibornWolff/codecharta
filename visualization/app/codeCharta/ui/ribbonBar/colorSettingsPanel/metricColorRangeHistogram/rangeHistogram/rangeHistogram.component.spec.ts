import { TestBed } from "@angular/core/testing"
import { RangeHistogramModule } from "./rangeHistogram.module"

describe("RangeHistogramComponent", () => {
	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [RangeHistogramModule]
		})
	})

	it("should display bars correctly", async () => {})

	it("should prevent left value input from submitting values lower than min value", async () => {})

	it("should prevent left value input from submitting values bigger than right value", async () => {})

	it("should prevent right value input from submitting values lower than left value", async () => {})

	it("should prevent right value input from submitting values bigger than max value", async () => {})

	it("should enable sliding of left thumb on mouse down and disabling it again on mouse up", async () => {})

	it("should enable sliding of right thumb on mouse down and disabling it again on mouse up", async () => {})

	it("should put last moved thumb on top, so an user can drag it again in case of overlapping thumbs", async () => {})
})
