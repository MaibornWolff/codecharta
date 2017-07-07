package de.maibornwolff.codecharta.util

class NullableMapMerger<T> {
    fun merge(map1: Map<T, Any>?, map2: Map<T, Any>?): Map<T, Any> {
        return when {
            map1 == null -> map2 ?: mapOf()
            map2 == null -> map1
            else -> map1.plus(map2)
        }
    }
}