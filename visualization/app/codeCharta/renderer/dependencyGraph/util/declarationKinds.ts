export type DeclarationShape = "rectangle" | "pill" | "sharp" | "hexagon" | "slanted"

export interface DeclarationKindLook {
    label: string
    letter: string
    /** The icon's colour. */
    color: string
    /** The box's fill when the kind is told by tint. */
    tint: string
    shape: DeclarationShape
}

export interface DeclarationKindLegendEntry extends DeclarationKindLook {
    kind: string
}

const OTHER_KIND = "other"

/** None of them is the blue of a cycle or the red of an upward edge, which the edges and the cycle badges keep. */
const LOOKS: Record<string, DeclarationKindLook> = {
    class: { label: "Class", letter: "C", color: "#0f766e", tint: "#ccfbf1", shape: "rectangle" },
    valueclass: { label: "Value class", letter: "V", color: "#0e7490", tint: "#cffafe", shape: "rectangle" },
    interface: { label: "Interface", letter: "I", color: "#15803d", tint: "#dcfce7", shape: "pill" },
    annotation: { label: "Annotation", letter: "@", color: "#a16207", tint: "#fef9c3", shape: "pill" },
    enum: { label: "Enum", letter: "E", color: "#7e22ce", tint: "#f3e8ff", shape: "sharp" },
    function: { label: "Function", letter: "ƒ", color: "#c2410c", tint: "#ffedd5", shape: "hexagon" },
    variable: { label: "Variable", letter: "x", color: "#be185d", tint: "#fce7f3", shape: "slanted" },
    [OTHER_KIND]: { label: "Other", letter: "?", color: "#6b7280", tint: "#f3f4f6", shape: "rectangle" }
}

export const DECLARATION_KIND_LEGEND: readonly DeclarationKindLegendEntry[] = Object.entries(LOOKS).map(([kind, look]) => ({
    kind,
    ...look
}))

/** The kinds are an open vocabulary: one this table does not know yet is drawn as any other. */
export function declarationKindLookOf(kind: string | undefined): DeclarationKindLook {
    return LOOKS[kind ?? OTHER_KIND] ?? LOOKS[OTHER_KIND]
}
