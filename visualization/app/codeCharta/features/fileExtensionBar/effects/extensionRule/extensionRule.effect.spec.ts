import { TestBed } from "@angular/core/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { Subject } from "rxjs"
import { CcState, NodeRule, RuleEffect } from "../../../../model/codeCharta.model"
import { addExcludedNodes, addFlattenedNodes } from "../../../../stores/sharedView/sharedView.write.facade"
import { ExtensionRuleEffect, ruleForExtensionsPattern } from "./extensionRule.effect"

describe("ExtensionRuleEffect", () => {
    let effect: ExtensionRuleEffect
    let actions$: Subject<Action>
    let store: MockStore<CcState>

    beforeEach(() => {
        actions$ = new Subject()

        TestBed.configureTestingModule({
            providers: [ExtensionRuleEffect, provideMockStore<CcState>({}), provideMockActions(() => actions$)]
        })
        store = TestBed.inject(MockStore)
        effect = TestBed.inject(ExtensionRuleEffect)
        effect.ruleForExtensions$.subscribe()

        jest.spyOn(store, "dispatch")
    })

    afterEach(() => {
        actions$.complete()
    })

    it.each<[RuleEffect]>([["flatten"], ["exclude"]])("should dispatch the rules into the %s list", effect => {
        // Arrange
        const extensions = ["*.ts", "*.js"]
        const parsedRules: NodeRule[] = [{ path: "*.ts" }, { path: "*.js" }]

        const action = ruleForExtensionsPattern(effect, ...extensions)
        const expectedAction = effect === "flatten" ? addFlattenedNodes({ items: parsedRules }) : addExcludedNodes({ items: parsedRules })

        // Act
        actions$.next(action)

        // Assert
        expect(store.dispatch).toHaveBeenCalledTimes(1)
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction)
    })
})
