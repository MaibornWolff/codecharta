import { DeclarationArrangement } from "../../../../model/dependencyGraph.model"
import { Choice } from "../choiceRow/choiceRow.component"

export const DECLARATION_ARRANGEMENT_CHOICES: Choice<DeclarationArrangement>[] = [
    { value: "stacked", label: "Stacked", hint: "In rows by level, the higher levels above the lower ones" },
    { value: "list", label: "List", hint: "One below the other, by name" },
    { value: "chips", label: "Chips", hint: "Small boxes as wide as their names, filling the rows" }
]
