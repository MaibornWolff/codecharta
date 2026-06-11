export const formatMetricNumber = (value: number | undefined): string => {
    if (value === undefined || Number.isNaN(value)) {
        return "-"
    }
    return value.toLocaleString("en-US")
}
