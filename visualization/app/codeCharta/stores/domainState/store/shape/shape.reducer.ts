import { createReducer, on } from "@ngrx/store"
import { defaultWordCloudSettings, WordCloudSettings } from "../../../../model/wordCloud.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setDomainStateShape } from "./shape.actions"

export const defaultShape: WordCloudSettings["shape"] = defaultWordCloudSettings.shape
export const shape = createReducer(defaultShape, on(setDomainStateShape, setState(defaultShape)))
