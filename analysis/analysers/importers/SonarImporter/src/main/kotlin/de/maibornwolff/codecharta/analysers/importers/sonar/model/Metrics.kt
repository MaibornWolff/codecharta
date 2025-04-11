package de.maibornwolff.codecharta.analysers.importers.sonar.model

/**
 * see https://github.com/SonarSource/sonarqube/tree/master/sonar-plugin-api
 */
data class Metrics(val metrics: List<MetricObject>? = null, val total: Int = 0)
