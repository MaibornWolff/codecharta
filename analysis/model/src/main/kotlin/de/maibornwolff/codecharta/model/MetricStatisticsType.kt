package de.maibornwolff.codecharta.model

class MetricStatisticsType {

    private val metricName: String

    private var min: Int? = null
    private var max = 0
    private var totalSum = 0
    private var numberOfFiles = 0
    //private var median: Number
    private var average = 0
    private var values = ArrayList<Int>()

    constructor(metricName: String, metricValue: Int) {
        this.metricName = metricName
        this.refresh(metricValue)
    }

    fun refresh(metricValue: Int) {
        this.values.add(metricValue)
        this.values = ArrayList(this.values.sorted())

        this.numberOfFiles++
        this.totalSum += metricValue
        this.average = this.totalSum / this.numberOfFiles

        if (this.min == null || (this.min != null && metricValue < this.min!!)) {
            this.min = metricValue
        }

        if (metricValue > this.max) {
            this.max = metricValue
        }
    }
}
