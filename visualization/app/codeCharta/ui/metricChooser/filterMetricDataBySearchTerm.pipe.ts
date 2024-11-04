import { Pipe, PipeTransform } from "@angular/core"
import { EdgeMetricData, NodeMetricData } from "../../codeCharta.model"

@Pipe({ name: "filterMetricDataBySearchTerm" })
export class FilterMetricDataBySearchTermPipe implements PipeTransform {
    transform(metricData: NodeMetricData[] | EdgeMetricData[], searchTerm: string) {
        const lowerCasedSearchTerm = searchTerm.toLocaleLowerCase()

        // after the "formerly mcc" is removed, change this back to the commented out code
        //return metricData.filter(data => data.name.toLocaleLowerCase().includes(lowerCasedSearchTerm))

        return metricData.filter(data => {
            let newName = data.name
            if (data.name === "complexity" || data.name === "sonar_complexity") {
                newName += " (formerly mcc)"
            }
            return newName.toLocaleLowerCase().includes(lowerCasedSearchTerm)
        })
    }
}
