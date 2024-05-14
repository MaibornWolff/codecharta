import { TestBed } from "@angular/core/testing"
import { Store } from "@ngrx/store"
import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { setColorMetric } from "../../../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { setColorRange } from "../../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setHeightMetric } from "../../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { ArtificialIntelligenceModule } from "../artificialIntelligence.module"
import { SuspiciousMetricComponent } from "./suspiciousMetrics.component"

describe("SuspiciousMetricsComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ArtificialIntelligenceModule],
			providers: [{ provide: Store, useValue: { dispatch: jest.fn() } }]
		})
	})

	describe("badge", () => {
		it("should show initially and hide on first click, but show again when data has changed", async () => {
			const { container, rerender } = await render(SuspiciousMetricComponent, {
				excludeComponentDeclaration: true,
				componentProperties: {
					data: {
						analyzedProgrammingLanguage: "ts",
						unsuspiciousMetrics: ["rloc", "mcc"],
						suspiciousMetricSuggestionLinks: [],
						untrackedMetrics: []
					}
				}
			})
			expect(container.querySelector(".suspicious-metrics-badge")).not.toBe(null)

			await userEvent.click(screen.getByTitle("Open Suspicious Metrics Panel"))
			await waitFor(() => expect(container.querySelector(".suspicious-metrics-badge")).toBe(null))

			await rerender({
				componentProperties: {
					data: {
						analyzedProgrammingLanguage: "ts",
						unsuspiciousMetrics: ["rloc"],
						suspiciousMetricSuggestionLinks: [],
						untrackedMetrics: []
					}
				}
			})
			expect(container.querySelector(".suspicious-metrics-badge")).not.toBe(null)
		})

		it("should show initially and hide on first click, but not show again when new data has same values", async () => {
			const { container, rerender } = await render(SuspiciousMetricComponent, {
				excludeComponentDeclaration: true,
				componentProperties: {
					data: {
						analyzedProgrammingLanguage: "ts",
						unsuspiciousMetrics: ["rloc", "mcc"],
						suspiciousMetricSuggestionLinks: [],
						untrackedMetrics: []
					}
				}
			})
			expect(container.querySelector(".suspicious-metrics-badge")).not.toBe(null)

			await userEvent.click(screen.getByTitle("Open Suspicious Metrics Panel"))
			await waitFor(() => expect(container.querySelector(".suspicious-metrics-badge")).toBe(null))

			await rerender({
				componentProperties: {
					data: {
						analyzedProgrammingLanguage: "ts",
						unsuspiciousMetrics: ["rloc", "mcc"],
						suspiciousMetricSuggestionLinks: [],
						untrackedMetrics: []
					}
				}
			})
			expect(container.querySelector(".suspicious-metrics-badge")).toBe(null)
		})

		it("should not show when nothing was analyzed", async () => {
			const { container } = await render(SuspiciousMetricComponent, {
				excludeComponentDeclaration: true,
				componentProperties: {
					data: {
						analyzedProgrammingLanguage: undefined,
						unsuspiciousMetrics: [],
						suspiciousMetricSuggestionLinks: [],
						untrackedMetrics: []
					}
				}
			})
			expect(container.querySelector(".suspicious-metrics-badge")).toBe(null)
		})
	})

	describe("panel", () => {
		it("should explain when there was nothing analyzed", async () => {
			await render(SuspiciousMetricComponent, {
				excludeComponentDeclaration: true,
				componentProperties: {
					data: {
						analyzedProgrammingLanguage: undefined,
						unsuspiciousMetrics: [],
						suspiciousMetricSuggestionLinks: [],
						untrackedMetrics: []
					}
				}
			})
			await userEvent.click(screen.getByTitle("Open Suspicious Metrics Panel"))
			expect(screen.getByText("No programming language was found for analyzing suspicious metrics.")).toBeTruthy()
			expect(screen.queryByText("Unsuspicious Metrics")).toBe(null)
			expect(screen.queryByText("Suspicious Metrics in undefined code")).toBe(null)
		})

		it("should render with some analyses", async () => {
			await render(SuspiciousMetricComponent, {
				excludeComponentDeclaration: true,
				componentProperties: {
					data: {
						analyzedProgrammingLanguage: "ts",
						unsuspiciousMetrics: ["rloc"],
						suspiciousMetricSuggestionLinks: [{ metric: "mcc", from: 10, to: 22 }],
						untrackedMetrics: []
					}
				}
			})
			await userEvent.click(screen.getByTitle("Open Suspicious Metrics Panel"))
			expect(screen.queryByText("No programming language was found for analyzing suspicious metrics.")).toBe(null)
			expect(screen.getByText("Unsuspicious Metrics in ts code")).not.toBe(null)
			expect(screen.getByText("rloc")).not.toBe(null)
			expect(screen.getByText("Suspicious Metrics in ts code")).not.toBe(null)
			expect(screen.getByText("Suspicious MCC Files")).not.toBe(null)

			await userEvent.click(screen.getByText("Suspicious MCC Files"), undefined)
			const store = TestBed.inject(Store)
			expect(store.dispatch).toHaveBeenCalledWith(setHeightMetric({ value: "mcc" }))
			expect(store.dispatch).toHaveBeenCalledWith(setColorMetric({ value: "mcc" }))
			expect(store.dispatch).toHaveBeenCalledWith(setColorRange({ value: { from: 10, to: 22 } }))
		})
	})

	describe("risk-button", () => {
		it("should set the color range to the correct percentile when very high risk files available", async () => {
			await render(SuspiciousMetricComponent, {
				excludeComponentDeclaration: true,
				componentProperties: {
					data: {
						analyzedProgrammingLanguage: "ts",
						unsuspiciousMetrics: ["rloc"],
						suspiciousMetricSuggestionLinks: [{ metric: "mcc", from: 10, to: 22, isOutlier: true, outlierThreshold: 120 }],
						untrackedMetrics: []
					}
				}
			})
			await userEvent.click(screen.getByTitle("Open Suspicious Metrics Panel"))
			await userEvent.click(screen.getByTitle("Show very high risk files (90th percentile)"), undefined)
			const store = TestBed.inject(Store)
			expect(store.dispatch).toHaveBeenCalledWith(setHeightMetric({ value: "mcc" }))
			expect(store.dispatch).toHaveBeenCalledWith(setColorMetric({ value: "mcc" }))
			expect(store.dispatch).toHaveBeenCalledWith(setColorRange({ value: { from: 10, to: 120 } }))
		})
	})
})
