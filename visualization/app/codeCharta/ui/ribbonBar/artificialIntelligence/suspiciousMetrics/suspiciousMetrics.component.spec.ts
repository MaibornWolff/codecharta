import { TestBed } from "@angular/core/testing"
import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { setColorMetric } from "../../../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { setColorRange } from "../../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setHeightMetric } from "../../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { ArtificialIntelligenceModule } from "../artificialIntelligence.module"
import { SuspiciousMetricsComponent } from "./suspiciousMetrics.component"
import { Store } from "@ngrx/store"

describe("SuspiciousMetricsComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ArtificialIntelligenceModule],
            providers: [{ provide: Store, useValue: { dispatch: jest.fn() } }]
        })
    })

    describe("badge", () => {
        it("should show initially and hide on first click, but show again when data has changed", async () => {
            const { container, rerender } = await render(SuspiciousMetricsComponent, {
                excludeComponentDeclaration: true,
                componentProperties: {
                    data: {
                        analyzedProgrammingLanguage: "ts",
                        unsuspiciousMetrics: ["rloc", "complexity"],
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
            const { container, rerender } = await render(SuspiciousMetricsComponent, {
                excludeComponentDeclaration: true,
                componentProperties: {
                    data: {
                        analyzedProgrammingLanguage: "ts",
                        unsuspiciousMetrics: ["rloc", "complexity"],
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
                        unsuspiciousMetrics: ["rloc", "complexity"],
                        suspiciousMetricSuggestionLinks: [],
                        untrackedMetrics: []
                    }
                }
            })
            expect(container.querySelector(".suspicious-metrics-badge")).toBe(null)
        })

        it("should not show when nothing was analyzed", async () => {
            const { container } = await render(SuspiciousMetricsComponent, {
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
            await render(SuspiciousMetricsComponent, {
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
            expect(screen.findByText("No programming language was found for analyzing suspicious metrics.")).toBeTruthy()
            expect(screen.queryByText("Unsuspicious Metrics")).toBe(null)
            expect(screen.queryByText("Suspicious Metrics in undefined code")).toBe(null)
        })

        it("should render with some analyses", async () => {
            await render(SuspiciousMetricsComponent, {
                excludeComponentDeclaration: true,
                componentProperties: {
                    data: {
                        analyzedProgrammingLanguage: "ts",
                        unsuspiciousMetrics: ["rloc"],
                        suspiciousMetricSuggestionLinks: [
                            { metric: "complexity", from: 10, to: 22 },
                            { metric: "code_smell", from: 5, to: 9 }
                        ],
                        untrackedMetrics: []
                    }
                }
            })
            await userEvent.click(screen.getByTitle("Open Suspicious Metrics Panel"))
            expect(screen.queryByText("No programming language was found for analyzing suspicious metrics.")).toBe(null)
            expect(screen.getByTitle("Suspicious Metrics in .ts code")).not.toBe(null)
            expect(screen.getByTitle("COMPLEXITY (cyclomatic complexity)")).not.toBe(null)
            expect(screen.getByTitle("COMPLEXITY (cyclomatic complexity)").getElementsByClassName("sub-sub-title")).toHaveLength(1)
            expect(screen.getByText("cyclomatic complexity")).not.toBe(null)
            expect(screen.getByTitle("CODE_SMELL")).not.toBe(null)
            expect(screen.getByTitle("CODE_SMELL").getElementsByClassName("sub-sub-title")).toHaveLength(0)

            expect(screen.getByTestId("Unsuspicious Metrics")).not.toBe(null)

            await userEvent.click(screen.getAllByText("Apply preset")[0], undefined)
            const store = TestBed.inject(Store)
            expect(store.dispatch).toHaveBeenCalledWith(setHeightMetric({ value: "complexity" }))
            expect(store.dispatch).toHaveBeenCalledWith(setColorMetric({ value: "complexity" }))
            expect(store.dispatch).toHaveBeenCalledWith(setColorRange({ value: { from: 10, to: 22 } }))
        })
    })

    describe("risk-button", () => {
        it("should set the color range to the correct percentile when very high risk files available", async () => {
            await render(SuspiciousMetricsComponent, {
                excludeComponentDeclaration: true,
                componentProperties: {
                    data: {
                        analyzedProgrammingLanguage: "ts",
                        unsuspiciousMetrics: ["rloc"],
                        suspiciousMetricSuggestionLinks: [
                            {
                                metric: "complexity",
                                from: 10,
                                to: 22,
                                isOutlier: true,
                                outlierThreshold: 120
                            }
                        ],
                        untrackedMetrics: []
                    }
                }
            })
            await userEvent.click(screen.getByTitle("Open Suspicious Metrics Panel"))
            await userEvent.click(screen.getByTitle("Show very high risk files (90th percentile)"), undefined)
            const store = TestBed.inject(Store)
            expect(store.dispatch).toHaveBeenCalledWith(setHeightMetric({ value: "complexity" }))
            expect(store.dispatch).toHaveBeenCalledWith(setColorMetric({ value: "complexity" }))
            expect(store.dispatch).toHaveBeenCalledWith(setColorRange({ value: { from: 10, to: 120 } }))
        })
    })

    describe("info-button", () => {
        it("should show the suspicious metrics information by clicking the information button", async () => {
            await render(SuspiciousMetricsComponent, {
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
            expect(screen.queryByTestId("suspiciousMetricPopover")).toBe(null)
            await userEvent.click(screen.getByTitle("Open Information about Suspicious Metrics"))
            expect(screen.queryByTestId("suspiciousMetricPopover")).not.toBe(null)
        })
    })

    describe("metrics-button", () => {
        it("should show the list of untracked metrics by clicking the expansion icon", async () => {
            const componentProperties = {
                data: {
                    analyzedProgrammingLanguage: "ts",
                    unsuspiciousMetrics: [],
                    suspiciousMetricSuggestionLinks: [],
                    untrackedMetrics: ["pairingRate", "avgCommits", "unary"]
                }
            }
            const { rerender } = await render(SuspiciousMetricsComponent, {
                excludeComponentDeclaration: true,
                componentProperties
            })
            await userEvent.click(screen.getByTitle("Open Suspicious Metrics Panel"))
            await userEvent.click(screen.queryByTestId("Untracked Metrics"))
            // Force the component to be redrawn with same content
            await rerender({
                componentProperties
            })

            expect(screen.getByTestId("List of Untracked Metrics in ts Code")).toBeDefined()
            expect(screen.getByText("pairingRate")).not.toBe(null)
            expect(screen.getByText("avgCommits")).not.toBe(null)
            expect(screen.queryByTestId("List of Unsuspicious Metrics in ts Code")).toBe(null)
        })

        it("should show the list of unsuspicious metrics by clicking the expansion icon", async () => {
            const componentProperties = {
                data: {
                    analyzedProgrammingLanguage: "ts",
                    unsuspiciousMetrics: ["pairingRate", "avgCommits", "unary"],
                    suspiciousMetricSuggestionLinks: [],
                    untrackedMetrics: []
                }
            }
            const { rerender } = await render(SuspiciousMetricsComponent, {
                excludeComponentDeclaration: true,
                componentProperties
            })
            await userEvent.click(screen.getByTitle("Open Suspicious Metrics Panel"))
            await userEvent.click(screen.queryByTestId("Unsuspicious Metrics"))

            // Force the component to be redrawn with same content
            await rerender({
                componentProperties
            })
            expect(screen.getByTestId("List of Unsuspicious Metrics in ts Code")).not.toBe(null)
            expect(screen.getByText("pairingRate")).not.toBe(null)
            expect(screen.getByText("avgCommits")).not.toBe(null)
            expect(screen.queryByTestId("List of Untrackted Metrics in ts Code")).toBe(null)
        })
    })
})
