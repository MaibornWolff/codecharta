import { DependencyEdgeStyle, DependencyEdgeThickness, LineStyleMeaning } from "../../../../model/dependencyGraph.model"
import { Choice } from "../choiceRow/choiceRow.component"

export const EDGE_STYLE_CHOICES: Choice<DependencyEdgeStyle>[] = [
    { value: "curved", label: "Curved", hint: "Leave and enter each box square to its side" },
    { value: "spread", label: "Spread", hint: "Curved, each edge with its own spot on the box" },
    { value: "upwardAside", label: "Upward aside", hint: "Upward edges bow out to the right of the boxes" },
    { value: "straight", label: "Straight", hint: "A straight line from box to box" }
]

export const EDGE_THICKNESS_CHOICES: Choice<DependencyEdgeThickness>[] = [
    { value: "byCount", label: "By count", hint: "Width grows with the dependencies an edge stands for" },
    { value: "thin", label: "Thin", hint: "Every edge a hairline, easiest to see through" },
    { value: "uniform", label: "Uniform", hint: "Every edge the same width" },
    { value: "strong", label: "Strong", hint: "Grows with the dependencies, twice as pronounced" }
]

export const LINE_STYLE_MEANING_CHOICES: Choice<LineStyleMeaning>[] = [
    { value: "edgeType", label: "Edge type", hint: "Dashed where an edge points upward without closing a cycle" },
    { value: "usage", label: "Kind of use", hint: "Dashes and arrowhead tell how one declaration uses the other" }
]

export function labelOf<Value extends string>(choices: Choice<Value>[], value: Value): string | null {
    return choices.find(choice => choice.value === value)?.label ?? null
}
