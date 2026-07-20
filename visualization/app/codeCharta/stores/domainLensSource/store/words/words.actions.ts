import { createAction, props } from "@ngrx/store"
import { DomainLensData } from "../../../../model/codeCharta.model"

export const setDomainWords = createAction("SET_DOMAIN_WORDS", props<{ value: DomainLensData }>())
