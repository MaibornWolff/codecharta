import { ColorRange } from "../../../../codeCharta.model"

export function getResetColorRange(maxMetricValue: number, minMetricValue: number): ColorRange {
	const firstThird = Math.round((maxMetricValue / 3) * 100) / 100
	const secondThird = Math.round(firstThird * 2 * 100) / 100
	return { from: firstThird, to: secondThird, min: minMetricValue, max: maxMetricValue }
}
