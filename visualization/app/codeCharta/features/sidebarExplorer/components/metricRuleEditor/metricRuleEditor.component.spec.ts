import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { of } from "rxjs"
import { EXPLORER_METRIC_RULES, ExplorerMetricRules, MetricValues } from "../../explorerMetricRules.port"
import { createExplorerMetricRulesMock } from "../../explorerPorts.mocks"
import { MetricRuleEditorComponent } from "./metricRuleEditor.component"

const METRIC_VALUES: MetricValues = new Map([
    ["mcc", [1, 2, 4, 12, 30]],
    ["rloc", [10, 20, 300]]
])

const inputsFor = (type: "flatten" | "exclude") => ({
    type,
    popoverId: `explorer-${type}-metric-rule`,
    anchorName: "explorer-search-actions"
})

describe("MetricRuleEditorComponent", () => {
    let metricRules: ExplorerMetricRules

    const setUp = (values: MetricValues = METRIC_VALUES) => {
        metricRules = createExplorerMetricRulesMock({ metricValues$: of(values) })
        TestBed.configureTestingModule({
            imports: [MetricRuleEditorComponent],
            providers: [{ provide: EXPLORER_METRIC_RULES, useValue: metricRules }]
        })
    }

    beforeEach(() => {
        setUp()
    })

    it("should offer every metric that some file has a value for", async () => {
        // Arrange & Act
        await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })

        // Assert
        const options = [...screen.getByTestId("metric-rule-editor-metric").querySelectorAll("option")]
        expect(options.map(option => option.textContent?.trim())).toEqual(["mcc", "rloc"])
    })

    it("should name the action it is about to take", async () => {
        // Arrange & Act
        await render(MetricRuleEditorComponent, { inputs: inputsFor("exclude") })

        // Assert
        expect(screen.getByText("Exclude by metric")).not.toBe(null)
        expect(screen.getByTestId("metric-rule-editor-submit").textContent).toContain("Add exclude rule")
    })

    it("should report how many files the condition matches", async () => {
        // Arrange
        await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })

        // Act — mcc greater than 3 matches 4, 12 and 30
        await userEvent.clear(screen.getByTestId("metric-rule-editor-value"))
        await userEvent.type(screen.getByTestId("metric-rule-editor-value"), "3")

        // Assert
        expect(screen.getByTestId("metric-rule-editor-match-count").textContent).toContain("3")
    })

    it("should ask for a second bound only for a between condition", async () => {
        // Arrange
        await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })

        // Act
        await userEvent.selectOptions(screen.getByTestId("metric-rule-editor-operator"), "between")

        // Assert
        expect(screen.queryByTestId("metric-rule-editor-upper-value")).not.toBe(null)
    })

    it("should add the rule that was configured", async () => {
        // Arrange
        await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })
        await userEvent.selectOptions(screen.getByTestId("metric-rule-editor-metric"), "rloc")
        await userEvent.selectOptions(screen.getByTestId("metric-rule-editor-operator"), "lt")
        await userEvent.clear(screen.getByTestId("metric-rule-editor-value"))
        await userEvent.type(screen.getByTestId("metric-rule-editor-value"), "50")

        // Act
        await userEvent.click(screen.getByTestId("metric-rule-editor-submit"))

        // Assert
        expect(metricRules.addRule).toHaveBeenCalledWith({
            metric: "rloc",
            operator: "lt",
            value: 50,
            upperValue: undefined,
            type: "flatten"
        })
    })

    it("should keep the upper bound of a between rule", async () => {
        // Arrange
        await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })
        await userEvent.selectOptions(screen.getByTestId("metric-rule-editor-operator"), "between")
        await userEvent.clear(screen.getByTestId("metric-rule-editor-value"))
        await userEvent.type(screen.getByTestId("metric-rule-editor-value"), "2")
        await userEvent.clear(screen.getByTestId("metric-rule-editor-upper-value"))
        await userEvent.type(screen.getByTestId("metric-rule-editor-upper-value"), "12")

        // Act
        await userEvent.click(screen.getByTestId("metric-rule-editor-submit"))

        // Assert
        expect(metricRules.addRule).toHaveBeenCalledWith(expect.objectContaining({ value: 2, upperValue: 12 }))
    })

    it("should match only the exact value for an equals condition", async () => {
        // Arrange
        await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })

        // Act
        await userEvent.selectOptions(screen.getByTestId("metric-rule-editor-operator"), "eq")
        await userEvent.clear(screen.getByTestId("metric-rule-editor-value"))
        await userEvent.type(screen.getByTestId("metric-rule-editor-value"), "4")

        // Assert
        expect(screen.getByTestId("metric-rule-editor-match-count").textContent).toContain("1")
    })

    it("should refuse to add a rule that matches nothing", async () => {
        // Arrange
        await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })

        // Act — no mcc value is above 1000
        await userEvent.clear(screen.getByTestId("metric-rule-editor-value"))
        await userEvent.type(screen.getByTestId("metric-rule-editor-value"), "1000")
        await userEvent.click(screen.getByTestId("metric-rule-editor-submit"))

        // Assert
        expect(metricRules.addRule).not.toHaveBeenCalled()
    })

    it("should add nothing when there is no metric to build a rule from", async () => {
        // Arrange
        TestBed.resetTestingModule()
        setUp(new Map())
        const { fixture } = await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })

        // Act
        fixture.componentInstance.addRule()

        // Assert
        expect(metricRules.addRule).not.toHaveBeenCalled()
    })

    it("should say so when there is nothing loaded to filter", async () => {
        // Arrange
        TestBed.resetTestingModule()
        setUp(new Map())

        // Act
        await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })

        // Assert
        expect(screen.getByText("Load a map to filter it by a metric")).not.toBe(null)
        expect(screen.queryByTestId("metric-rule-editor-submit")).toBe(null)
    })
})
