import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainBarDrawOutOfBound = createAction(
    "SET_DOMAIN_BAR_DRAW_OUT_OF_BOUND",
    props<{ value: WordCloudSettings["drawOutOfBound"] }>()
)
