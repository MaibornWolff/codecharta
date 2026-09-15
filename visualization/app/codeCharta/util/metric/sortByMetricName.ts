export const sortByMetricName = (metricData: { name: string }[]) => {
    metricData.sort((a, b) => {
        const aLower = a.name.toLowerCase()
        const bLower = b.name.toLowerCase()
        if (aLower > bLower) {
            return 1
        }
        return bLower > aLower ? -1 : 0
    })
}
