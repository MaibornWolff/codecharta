import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainStateTopN = createAction("SET_DOMAIN_STATE_TOP_N", props<{ value: WordCloudSettings["topN"] }>())
