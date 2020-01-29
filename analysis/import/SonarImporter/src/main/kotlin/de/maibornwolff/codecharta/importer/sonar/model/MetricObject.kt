package de.maibornwolff.codecharta.importer.sonar.model

/**
 * see https://github.com/SonarSource/sonarqube/tree/master/sonar-plugin-api
 */
data class MetricObject(val key: String, private val type: String) {

    val isFloatType: Boolean
        get() = FLOAT_TYPES.contains(type)

    companion object {
        private val FLOAT_TYPES = listOf("INT", "FLOAT", "PERCENT")
    }
}
