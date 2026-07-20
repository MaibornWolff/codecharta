import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainBarShape = createAction("SET_DOMAIN_BAR_SHAPE", props<{ value: WordCloudSettings["shape"] }>())
