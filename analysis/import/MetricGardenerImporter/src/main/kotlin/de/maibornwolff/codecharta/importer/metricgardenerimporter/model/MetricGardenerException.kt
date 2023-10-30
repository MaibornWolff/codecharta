package de.maibornwolff.codecharta.importer.metricgardenerimporter.model

class MetricGardenerException : Exception {
    constructor() : super()
    constructor(message: String) : super(message)
    constructor(message: String, cause: Throwable) : super(message, cause)
    constructor(cause: Throwable) : super(cause)
}
