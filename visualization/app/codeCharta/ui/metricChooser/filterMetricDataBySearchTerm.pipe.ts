import { Pipe, PipeTransform } from "@angular/core"
import { EdgeMetricData, NodeMetricData } from "../../codeCharta.model"

// Configuration for metric aliases and display name modifications
const METRIC_ALIASES: Record<string, string[]> = {
    complexity: ["formerly mcc"],
    sonar_complexity: ["formerly mcc"]
}

@Pipe({
    name: "filterMetricDataBySearchTerm",
    standalone: true
})
export class FilterMetricDataBySearchTermPipe implements PipeTransform {
    transform(metricData: NodeMetricData[] | EdgeMetricData[], searchTerm: string) {
        const normalizedSearchTerm = this.normalizeString(searchTerm.trim())
        const searchWords = this.splitIntoWords(normalizedSearchTerm)

        return metricData.filter(data => {
            const normalizedMetricName = this.normalizeString(this.getDisplayName(data.name))
            return this.matchesSearch(normalizedMetricName, searchWords)
        })
    }

    private normalizeString(text: string): string {
        return text.toLocaleLowerCase().replace(/[_\-\s]+/g, " ")
    }

    private splitIntoWords(normalizedText: string): string[] {
        return normalizedText.split(" ").filter(word => word.length > 0)
    }

    private getDisplayName(metricName: string): string {
        const aliases = METRIC_ALIASES[metricName]
        if (aliases) {
            return `${metricName} ${aliases.join(" ")}`
        }
        return metricName
    }

    private matchesSearch(normalizedMetricName: string, searchWords: string[]): boolean {
        if (searchWords.length === 0) {
            return true
        }

        return searchWords.every(searchWord => normalizedMetricName.includes(searchWord))
    }
}
