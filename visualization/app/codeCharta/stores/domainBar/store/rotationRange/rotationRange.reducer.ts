import { createReducer, on } from "@ngrx/store"
import { defaultWordCloudSettings, WordCloudSettings } from "../../../../model/wordCloud.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setDomainBarRotationRange } from "./rotationRange.actions"

export const defaultRotationRange: WordCloudSettings["rotationRange"] = defaultWordCloudSettings.rotationRange
export const rotationRange = createReducer(defaultRotationRange, on(setDomainBarRotationRange, setState(defaultRotationRange)))
