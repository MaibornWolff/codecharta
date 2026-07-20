import { createReducer, on } from "@ngrx/store"
import { defaultWordCloudSettings, WordCloudSettings } from "../../../../model/wordCloud.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setDomainBarDrawOutOfBound } from "./drawOutOfBound.actions"

export const defaultDrawOutOfBound: WordCloudSettings["drawOutOfBound"] = defaultWordCloudSettings.drawOutOfBound
export const drawOutOfBound = createReducer(defaultDrawOutOfBound, on(setDomainBarDrawOutOfBound, setState(defaultDrawOutOfBound)))
