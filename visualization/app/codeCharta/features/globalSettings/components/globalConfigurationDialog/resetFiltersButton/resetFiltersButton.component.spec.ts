import { TestBed } from "@angular/core/testing"
import { Store, StoreModule } from "@ngrx/store"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { firstValueFrom } from "rxjs"
import { BlacklistItem, CcState, MetricRule } from "../../../../../model/codeCharta.model"
import { appReducers, setStateMiddleware } from "../../../../../stores/rootStore/store"
import { blacklistSelector, metricRulesSelector } from "../../../../../stores/sharedView/sharedView.read.facade"
import { addBlacklistItems, addMetricRule } from "../../../../../stores/sharedView/sharedView.write.facade"
import { ResetFiltersButtonComponent } from "./resetFiltersButton.component"

const flattenItem: BlacklistItem = { path: "**/*.spec.ts", type: "flatten" }
const excludeRule: MetricRule = { id: "a", metric: "rloc", operator: "lt", value: 5, type: "exclude" }

const storeOf = () => TestBed.inject<Store<CcState>>(Store)

describe("ResetFiltersButtonComponent", () => {
    beforeEach(() => {
        HTMLDialogElement.prototype.showModal = jest.fn()
        HTMLDialogElement.prototype.close = jest.fn()
        TestBed.configureTestingModule({
            imports: [ResetFiltersButtonComponent, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
    })

    const addBothKindsOfRule = () => {
        storeOf().dispatch(addBlacklistItems({ items: [flattenItem] }))
        storeOf().dispatch(addMetricRule({ rule: excludeRule }))
    }

    it("should be disabled while there is no rule to reset", async () => {
        // Arrange & Act
        await render(ResetFiltersButtonComponent)

        // Assert
        expect(screen.getByTestId<HTMLButtonElement>("reset-filters-button").disabled).toBe(true)
    })

    it("should be enabled once a rule exists", async () => {
        // Arrange
        await render(ResetFiltersButtonComponent)

        // Act
        addBothKindsOfRule()
        await screen.findByTitle(/Remove every flatten and hide rule/)

        // Assert
        expect(screen.getByTestId<HTMLButtonElement>("reset-filters-button").disabled).toBe(false)
    })

    it("should ask before resetting, naming how many rules go", async () => {
        // Arrange
        await render(ResetFiltersButtonComponent)
        addBothKindsOfRule()

        // Act
        await userEvent.click(screen.getByTestId("reset-filters-button"))

        // Assert
        expect(screen.getByText(/All 2 flatten and hide rules are removed/)).not.toBe(null)
    })

    it("should name a single rule in the singular", async () => {
        // Arrange
        await render(ResetFiltersButtonComponent)
        storeOf().dispatch(addBlacklistItems({ items: [flattenItem] }))

        // Act
        await userEvent.click(screen.getByTestId("reset-filters-button"))

        // Assert
        expect(screen.getByText(/The 1 flatten or hide rule is removed/)).not.toBe(null)
    })

    it("should remove both kinds of rule when the reset is confirmed", async () => {
        // Arrange
        await render(ResetFiltersButtonComponent)
        addBothKindsOfRule()
        await userEvent.click(screen.getByTestId("reset-filters-button"))

        // Act
        await userEvent.click(screen.getByTestId("confirm-dialog-yes"))

        // Assert
        expect(await firstValueFrom(storeOf().select(blacklistSelector))).toEqual([])
        expect(await firstValueFrom(storeOf().select(metricRulesSelector))).toEqual([])
    })

    it("should keep the rules when the reset is declined", async () => {
        // Arrange
        await render(ResetFiltersButtonComponent)
        addBothKindsOfRule()
        await userEvent.click(screen.getByTestId("reset-filters-button"))

        // Act
        await userEvent.click(screen.getByTestId("confirm-dialog-no"))

        // Assert
        expect(await firstValueFrom(storeOf().select(blacklistSelector))).toEqual([flattenItem])
    })
})
