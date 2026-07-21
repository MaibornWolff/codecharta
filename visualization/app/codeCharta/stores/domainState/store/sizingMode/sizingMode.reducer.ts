import { createReducer, on } from "@ngrx/store"
import { defaultWordCloudSettings, WordCloudSettings } from "../../../../model/wordCloud.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setDomainStateSizingMode } from "./sizingMode.actions"

export const defaultSizingMode: WordCloudSettings["sizingMode"] = defaultWordCloudSettings.sizingMode
export const sizingMode = createReducer(defaultSizingMode, on(setDomainStateSizingMode, setState(defaultSizingMode)))
