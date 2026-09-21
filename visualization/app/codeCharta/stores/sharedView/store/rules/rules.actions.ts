import { createAction, props } from "@ngrx/store"
import { RuleEffect } from "../../../../model/codeCharta.model"

/**
 * Empties one of the two rule lists. The excluded nodes, the flattened nodes and the metric rules
 * all reduce it, because a list the user sees as "Flattened" is made of a path list and a metric
 * list and has to empty in one step.
 */
export const clearRulesOfType = createAction("CLEAR_RULES_OF_TYPE", props<{ ruleEffect: RuleEffect }>())
