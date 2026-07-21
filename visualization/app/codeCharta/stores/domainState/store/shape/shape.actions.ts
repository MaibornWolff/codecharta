import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainStateShape = createAction("SET_DOMAIN_STATE_SHAPE", props<{ value: WordCloudSettings["shape"] }>())
