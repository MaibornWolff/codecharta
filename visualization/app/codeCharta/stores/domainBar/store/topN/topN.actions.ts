import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainBarTopN = createAction("SET_DOMAIN_BAR_TOP_N", props<{ value: WordCloudSettings["topN"] }>())
