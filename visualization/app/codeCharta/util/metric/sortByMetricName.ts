export const sortByMetricName = (metricData: { name: string }[]) => {
    metricData.sort((a, b) => {
        const aLower = a.name.toLowerCase()
        const bLower = b.name.toLowerCase()
        return aLower > bLower ? 1 : bLower > aLower ? -1 : 0
    })
}
