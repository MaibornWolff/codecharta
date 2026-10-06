export type DeclarationShape = "plain" | "dashed" | "double" | "hexagon"

export interface DeclarationKindLook {
    label: string
    letter: string
    /** The icon's fill, and the box's when the kind is told by tint. */
    tint: string
    shape: DeclarationShape
}

export interface DeclarationKindLegendEntry extends DeclarationKindLook {
    kind: string
}

const OTHER_KIND = "other"

/** Pale enough for a dark letter, and none of them the blue of a cycle or the red of an upward edge. */
const LOOKS: Record<string, DeclarationKindLook> = {
    class: { label: "Class", letter: "C", tint: "#dbe7f5", shape: "plain" },
    valueclass: { label: "Value class", letter: "D", tint: "#d8eef0", shape: "plain" },
    interface: { label: "Interface", letter: "I", tint: "#dff3e4", shape: "dashed" },
    enum: { label: "Enum", letter: "E", tint: "#fdecc8", shape: "double" },
    annotation: { label: "Annotation", letter: "@", tint: "#efe1f7", shape: "hexagon" },
    function: { label: "Function", letter: "ƒ", tint: "#fde2e0", shape: "plain" },
    variable: { label: "Variable", letter: "V", tint: "#e6e9ee", shape: "plain" },
    [OTHER_KIND]: { label: "Other", letter: "?", tint: "#f1f2f4", shape: "plain" }
}

export const KIND_ICON_COLORS = { stroke: "#7d8898", letter: "#374151" }

export const DECLARATION_KIND_LEGEND: readonly DeclarationKindLegendEntry[] = Object.entries(LOOKS).map(([kind, look]) => ({
    kind,
    ...look
}))

/** The kinds are an open vocabulary: one this table does not know yet is drawn as any other. */
export function declarationKindLookOf(kind: string | undefined): DeclarationKindLook {
    return LOOKS[kind ?? OTHER_KIND] ?? LOOKS[OTHER_KIND]
}

/** A kind this table does not know yet is still told by the name its language gave it. */
export function declarationKindLabelOf(kind: string): string {
    return LOOKS[kind]?.label ?? kind
}
