import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainBarRotationRange = createAction(
    "SET_DOMAIN_BAR_ROTATION_RANGE",
    props<{ value: WordCloudSettings["rotationRange"] }>()
)
