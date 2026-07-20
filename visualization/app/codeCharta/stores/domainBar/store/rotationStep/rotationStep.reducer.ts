import { createReducer, on } from "@ngrx/store"
import { defaultWordCloudSettings, WordCloudSettings } from "../../../../model/wordCloud.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setDomainBarRotationStep } from "./rotationStep.actions"

export const defaultRotationStep: WordCloudSettings["rotationStep"] = defaultWordCloudSettings.rotationStep
export const rotationStep = createReducer(defaultRotationStep, on(setDomainBarRotationStep, setState(defaultRotationStep)))
