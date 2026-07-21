import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainStateSizingMode = createAction("SET_DOMAIN_STATE_SIZING_MODE", props<{ value: WordCloudSettings["sizingMode"] }>())
