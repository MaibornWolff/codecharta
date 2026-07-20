import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainBarSizeRange = createAction("SET_DOMAIN_BAR_SIZE_RANGE", props<{ value: WordCloudSettings["sizeRange"] }>())
