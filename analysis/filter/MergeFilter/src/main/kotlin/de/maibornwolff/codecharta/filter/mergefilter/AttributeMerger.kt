package de.maibornwolff.codecharta.filter.mergefilter

class AttributeMerger {
    fun merge(attributes: Map<String, Any>?, attributes1: Map<String, Any>?): Map<String, Any>? {
        return when {
            attributes == null && attributes1 == null -> mapOf()
            attributes == null || attributes.isEmpty() -> attributes1!!
            attributes1 == null || attributes1.isEmpty() -> attributes
            else -> attributes.plus(attributes1)
        }
    }
}