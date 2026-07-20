import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainBarShrinkToFit = createAction("SET_DOMAIN_BAR_SHRINK_TO_FIT", props<{ value: WordCloudSettings["shrinkToFit"] }>())
