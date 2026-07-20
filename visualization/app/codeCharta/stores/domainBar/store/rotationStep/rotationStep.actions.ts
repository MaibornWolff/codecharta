import { createAction, props } from "@ngrx/store"
import { WordCloudSettings } from "../../../../model/wordCloud.model"

export const setDomainBarRotationStep = createAction("SET_DOMAIN_BAR_ROTATION_STEP", props<{ value: WordCloudSettings["rotationStep"] }>())
