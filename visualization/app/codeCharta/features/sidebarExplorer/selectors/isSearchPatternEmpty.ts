import { compileSearchQuery } from "../../../util/nodeRules/searchQuery"

export const isSearchPatternEmpty = (searchPattern: string) => compileSearchQuery(searchPattern) === ""
