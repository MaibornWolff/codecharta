package de.maibornwolff.codecharta.model

internal fun <T> mergeByKey(own: Map<String, T>, other: Map<String, T>, reconcile: (String, T, T) -> T): Map<String, T> {
    if (own.isEmpty()) return other
    if (other.isEmpty()) return own

    val merged = LinkedHashMap(own)
    other.forEach { (key, entry) ->
        val existing = merged[key]
        merged[key] = if (existing == null) entry else reconcile(key, existing, entry)
    }
    return merged
}
