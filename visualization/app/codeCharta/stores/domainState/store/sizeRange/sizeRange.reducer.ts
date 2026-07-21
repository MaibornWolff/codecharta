import { createReducer, on } from "@ngrx/store"
import { defaultWordCloudSettings, WordCloudSettings } from "../../../../model/wordCloud.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setDomainStateSizeRange } from "./sizeRange.actions"

export const defaultSizeRange: WordCloudSettings["sizeRange"] = defaultWordCloudSettings.sizeRange
export const sizeRange = createReducer(defaultSizeRange, on(setDomainStateSizeRange, setState(defaultSizeRange)))
