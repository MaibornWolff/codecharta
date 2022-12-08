export const sortByMetricKey = (metricData: { key: string }[]) => {
	metricData.sort((a, b) => {
		const aLower = a.key.toLowerCase()
		const bLower = b.key.toLowerCase()
		return aLower > bLower ? 1 : bLower > aLower ? -1 : 0
	})
}
