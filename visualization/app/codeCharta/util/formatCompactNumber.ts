const compactFormatter = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })

export function formatCompactNumber(value: number | null | undefined): string {
    if (value == null) {
        return ""
    }
    return compactFormatter.format(value)
}
