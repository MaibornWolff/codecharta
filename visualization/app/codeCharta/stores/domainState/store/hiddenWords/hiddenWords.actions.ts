import { createAction, props } from "@ngrx/store"

/** Restores a whole list at once, which is what re-applying a saved session's domain state needs. */
export const setDomainStateHiddenWords = createAction("SET_DOMAIN_STATE_HIDDEN_WORDS", props<{ value: string[] }>())

export const hideDomainWord = createAction("HIDE_DOMAIN_WORD", props<{ word: string }>())
export const restoreDomainWord = createAction("RESTORE_DOMAIN_WORD", props<{ word: string }>())
export const restoreAllDomainWords = createAction("RESTORE_ALL_DOMAIN_WORDS")
