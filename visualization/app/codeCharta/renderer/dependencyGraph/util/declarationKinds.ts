export interface DeclarationKindLook {
    label: string
    letter: string
    tint: string
}

export interface DeclarationKindLegendEntry extends DeclarationKindLook {
    kind: string
}

const OTHER_KIND = "other"

/** Pale enough for a dark letter, and none of them the blue of a cycle or the red of an upward edge. */
const LOOKS = new Map<string, DeclarationKindLook>(
    Object.entries({
        class: { label: "Class", letter: "C", tint: "#dbe7f5" },
        valueclass: { label: "Value class", letter: "D", tint: "#d8eef0" },
        interface: { label: "Interface", letter: "I", tint: "#dff3e4" },
        enum: { label: "Enum", letter: "E", tint: "#fdecc8" },
        annotation: { label: "Annotation", letter: "@", tint: "#efe1f7" },
        function: { label: "Function", letter: "ƒ", tint: "#fde2e0" },
        variable: { label: "Variable", letter: "V", tint: "#e6e9ee" },
        [OTHER_KIND]: { label: "Other", letter: "?", tint: "#f1f2f4" }
    })
)

export const KIND_ICON_COLORS = { stroke: "#7d8898", letter: "#374151" }

export const DECLARATION_KIND_LEGEND: readonly DeclarationKindLegendEntry[] = [...LOOKS].map(([kind, look]) => ({
    kind,
    ...look
}))

/** The kinds are an open vocabulary: one this table does not know yet is drawn as any other. */
export function declarationKindLookOf(kind: string | undefined): DeclarationKindLook {
    return LOOKS.get(kind ?? OTHER_KIND) ?? LOOKS.get(OTHER_KIND)
}

/** A kind this table does not know yet is still told by the name its language gave it. */
export function declarationKindLabelOf(kind: string): string {
    return LOOKS.get(kind)?.label ?? kind
}
