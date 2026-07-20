import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainBarSizingMode = createAction("SET_DOMAIN_BAR_SIZING_MODE", props<{ value: WordCloudSettings["sizingMode"] }>())
