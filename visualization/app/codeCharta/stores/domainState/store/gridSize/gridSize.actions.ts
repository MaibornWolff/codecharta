import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainStateGridSize = createAction("SET_DOMAIN_STATE_GRID_SIZE", props<{ value: WordCloudSettings["gridSize"] }>())
