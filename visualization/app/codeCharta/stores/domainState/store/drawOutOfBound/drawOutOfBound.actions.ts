import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainStateDrawOutOfBound = createAction(
    "SET_DOMAIN_STATE_DRAW_OUT_OF_BOUND",
    props<{ value: WordCloudSettings["drawOutOfBound"] }>()
)
