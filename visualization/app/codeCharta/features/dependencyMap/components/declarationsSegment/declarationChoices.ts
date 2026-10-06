import { DeclarationArrangement, DeclarationKindMark } from "../../../../model/dependencyGraph.model"
import { Choice } from "../choiceRow/choiceRow.component"

export const DECLARATION_ARRANGEMENT_CHOICES: Choice<DeclarationArrangement>[] = [
    { value: "stacked", label: "Stacked", hint: "In rows by level, the higher levels above the lower ones" },
    { value: "list", label: "List", hint: "One below the other, by name" },
    { value: "chips", label: "Chips", hint: "Small boxes as wide as their names, filling the rows" }
]

export const DECLARATION_KIND_MARK_CHOICES: Choice<DeclarationKindMark>[] = [
    { value: "icon", label: "Icon", hint: "A lettered icon before the name: C for a class, I for an interface, …" },
    { value: "shape", label: "Shape", hint: "The box's outline: round for an interface, pointed for a function, …" },
    { value: "tint", label: "Tint", hint: "The box's colour" },
    { value: "off", label: "Off", hint: "Every declaration looks the same" }
]
