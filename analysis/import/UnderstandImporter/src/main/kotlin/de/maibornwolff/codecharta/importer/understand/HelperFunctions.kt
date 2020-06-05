package de.maibornwolff.codecharta.importer.understand

fun getSumOrFirst(): (Any, Any) -> Any =
    { x, y ->
        when {
            (x is Long || x is Int || x is Short || x is Byte)
                && (y is Long || y is Int || y is Short || y is Byte) ->
                (x as Number).toLong() + (y as Number).toLong()
            x is Number && y is Number -> x.toDouble() + y.toDouble()
            x !is Number && y is Number -> y
            else -> x
        }
    }

fun getMaxValOrFirst(): (Any, Any) -> Any =
    { x, y ->
        when {
            (x is Long || x is Int || x is Short || x is Byte)
                && (y is Long || y is Int || y is Short || y is Byte) ->
                maxOf((x as Number).toLong(), (y as Number).toLong())
            x is Number && y is Number -> maxOf(x.toDouble(), y.toDouble())
            x !is Number && y is Number -> y
            else -> x
        }
    }

fun <K, V> Map<K, V>.mergeReduce(other: Map<K, V>, reduce: (V, V) -> V = { _, b -> b }): Map<K, V> =
    this.toMutableMap().apply { other.forEach { merge(it.key, it.value, reduce) } }

fun <K, V> Map<K, V>.mergeReduce(other: Map<K, V>, reductionMap: Map<K, (V, V) -> V> = mapOf()): Map<K, V> =
    this.toMutableMap().apply {
        other.forEach {
            merge(it.key, it.value, reductionMap[it.key] ?: { _, b -> b })
        }
    }


