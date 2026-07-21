import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainStateShrinkToFit = createAction(
    "SET_DOMAIN_STATE_SHRINK_TO_FIT",
    props<{ value: WordCloudSettings["shrinkToFit"] }>()
)
