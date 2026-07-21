import { createReducer, on } from "@ngrx/store"
import { defaultWordCloudSettings, WordCloudSettings } from "../../../../model/wordCloud.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setDomainStateGridSize } from "./gridSize.actions"

export const defaultGridSize: WordCloudSettings["gridSize"] = defaultWordCloudSettings.gridSize
export const gridSize = createReducer(defaultGridSize, on(setDomainStateGridSize, setState(defaultGridSize)))
