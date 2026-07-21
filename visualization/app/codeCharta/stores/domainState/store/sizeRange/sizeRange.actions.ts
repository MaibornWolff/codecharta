import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainStateSizeRange = createAction("SET_DOMAIN_STATE_SIZE_RANGE", props<{ value: WordCloudSettings["sizeRange"] }>())
