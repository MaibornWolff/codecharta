import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainStateRotationStep = createAction(
    "SET_DOMAIN_STATE_ROTATION_STEP",
    props<{ value: WordCloudSettings["rotationStep"] }>()
)
