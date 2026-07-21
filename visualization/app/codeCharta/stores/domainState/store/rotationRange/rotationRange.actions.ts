import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainStateRotationRange = createAction(
    "SET_DOMAIN_STATE_ROTATION_RANGE",
    props<{ value: WordCloudSettings["rotationRange"] }>()
)
