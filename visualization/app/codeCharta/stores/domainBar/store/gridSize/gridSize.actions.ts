import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainBarGridSize = createAction("SET_DOMAIN_BAR_GRID_SIZE", props<{ value: WordCloudSettings["gridSize"] }>())
