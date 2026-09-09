import { createAction, props } from "@ngrx/store"
import { BlacklistType } from "../../../../model/codeCharta.model"

/**
 * Empties one of the two rule lists. Both the blacklist and the metric rules reduce it, because a
 * list the user sees as "Flattened" is made of both and has to empty in one step.
 */
export const clearRulesOfType = createAction("CLEAR_RULES_OF_TYPE", props<{ blacklistType: BlacklistType }>())
