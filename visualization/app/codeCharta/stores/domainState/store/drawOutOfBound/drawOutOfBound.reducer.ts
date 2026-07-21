import { createReducer, on } from "@ngrx/store"
import { defaultWordCloudSettings, WordCloudSettings } from "../../../../model/wordCloud.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setDomainStateDrawOutOfBound } from "./drawOutOfBound.actions"

export const defaultDrawOutOfBound: WordCloudSettings["drawOutOfBound"] = defaultWordCloudSettings.drawOutOfBound
export const drawOutOfBound = createReducer(defaultDrawOutOfBound, on(setDomainStateDrawOutOfBound, setState(defaultDrawOutOfBound)))
