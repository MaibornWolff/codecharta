import { ComponentFixture, TestBed } from "@angular/core/testing"
import { render, screen, within } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { BehaviorSubject, Observable, of } from "rxjs"
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

// the picker renders its options lazily, so simulate the popover opening
function openMetricPicker(fixture: ComponentFixture<MetricRuleEditorComponent>): HTMLElement {
    const picker = screen.getByTestId(`metric-select-popover-${fixture.componentInstance.metricPickerAnchorName()}`)
    const toggleEvent = new Event("toggle")
    Object.assign(toggleEvent, { newState: "open" })
    picker.dispatchEvent(toggleEvent)
    fixture.detectChanges()
    return picker
}

async function chooseMetric(fixture: ComponentFixture<MetricRuleEditorComponent>, metric: string) {
    const picker = openMetricPicker(fixture)
    await userEvent.click(picker.querySelector(`[data-metric-name='${metric}']`) as HTMLElement)
}

describe("MetricRuleEditorComponent", () => {
    let metricRules: ExplorerMetricRules

    const setUp = (metricValues$: Observable<MetricValues> = of(METRIC_VALUES)) => {
        metricRules = createExplorerMetricRulesMock({ metricValues$ })
        TestBed.configureTestingModule({
            imports: [MetricRuleEditorComponent],
            providers: [{ provide: EXPLORER_METRIC_RULES, useValue: metricRules }]
        })
    }

    beforeEach(() => {
        setUp()
    })

    it("should offer every metric that some file has a value for, with its highest value", async () => {
        // Arrange
        const { fixture } = await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })

        // Act
        const picker = openMetricPicker(fixture)

        // Assert
        const options = [...picker.querySelectorAll("[data-metric-name]")]
        expect(options.map(option => option.getAttribute("data-metric-name"))).toEqual(["mcc", "rloc"])
        expect(within(picker).getByText("(300)")).not.toBe(null)
    })

    it("should show the chosen metric on the picker button", async () => {
        // Arrange
        const { fixture } = await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })

        // Act
        await chooseMetric(fixture, "rloc")

        // Assert
        expect(screen.getByTestId("metric-rule-editor-metric").textContent?.trim()).toBe("rloc")
        expect(screen.getByTestId("metric-rule-editor-match-count").textContent).toContain("of 3 files")
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
        const { fixture } = await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })
        await chooseMetric(fixture, "rloc")
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

    it("should refuse to add a rule while the threshold is empty", async () => {
        // Arrange
        await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })

        // Act — read as 0, an empty threshold would be "greater than 0", which every mcc value matches
        await userEvent.clear(screen.getByTestId("metric-rule-editor-value"))
        await userEvent.click(screen.getByTestId("metric-rule-editor-submit"))

        // Assert
        expect(metricRules.addRule).not.toHaveBeenCalled()
    })

    it("should refuse to add a between rule while its upper bound is empty", async () => {
        // Arrange
        await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })
        await userEvent.selectOptions(screen.getByTestId("metric-rule-editor-operator"), "between")
        await userEvent.clear(screen.getByTestId("metric-rule-editor-value"))
        await userEvent.type(screen.getByTestId("metric-rule-editor-value"), "2")

        // Act — read as 0, an empty upper bound would be "between 0 and 2", which mcc 1 and 2 match
        await userEvent.clear(screen.getByTestId("metric-rule-editor-upper-value"))
        await userEvent.click(screen.getByTestId("metric-rule-editor-submit"))

        // Assert
        expect(metricRules.addRule).not.toHaveBeenCalled()
    })

    it("should keep a cleared threshold empty instead of writing NaN into it", async () => {
        // Arrange
        const { fixture } = await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })

        // Act
        await userEvent.clear(screen.getByTestId("metric-rule-editor-value"))

        // Assert
        expect(fixture.componentInstance.valueText()).toBe("")
    })

    it("should keep a cleared upper threshold empty instead of writing NaN into it", async () => {
        // Arrange
        const { fixture } = await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })
        await userEvent.selectOptions(screen.getByTestId("metric-rule-editor-operator"), "between")

        // Act
        await userEvent.clear(screen.getByTestId("metric-rule-editor-upper-value"))

        // Assert
        expect(fixture.componentInstance.upperValueText()).toBe("")
    })

    it("should fall back to a loaded metric when the chosen one is no longer loaded", async () => {
        // Arrange
        const metricValues$ = new BehaviorSubject<MetricValues>(METRIC_VALUES)
        TestBed.resetTestingModule()
        setUp(metricValues$)
        const { fixture } = await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })
        await chooseMetric(fixture, "rloc")

        // Act
        metricValues$.next(new Map([["mcc", [1, 2, 4, 12, 30]]]))
        fixture.detectChanges()

        // Assert
        expect(screen.getByTestId("metric-rule-editor-match-count").textContent).toContain("of 5 files")
    })

    it("should add nothing when there is no metric to build a rule from", async () => {
        // Arrange
        TestBed.resetTestingModule()
        setUp(of(new Map()))
        const { fixture } = await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })

        // Act
        fixture.componentInstance.addRule()

        // Assert
        expect(metricRules.addRule).not.toHaveBeenCalled()
    })

    it("should say so when there is nothing loaded to filter", async () => {
        // Arrange
        TestBed.resetTestingModule()
        setUp(of(new Map()))

        // Act
        await render(MetricRuleEditorComponent, { inputs: inputsFor("flatten") })

        // Assert
        expect(screen.getByText("Load a map to filter it by a metric")).not.toBe(null)
        expect(screen.queryByTestId("metric-rule-editor-submit")).toBe(null)
    })
})
