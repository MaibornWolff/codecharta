package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * What tells an object a file creates apart from the others: its name and, where the file writes one, its schema. An
 * object without a schema is the object of the same name in a schema when the file holds that name in exactly one
 * schema, as a file that creates dbo.orders and then alters orders means one table.
 */
data class ObjectKey(val name: String, val schema: String? = null) {
    companion object {
        fun countDistinct(keys: Collection<ObjectKey>): Int = keys.groupBy { it.name }.values.sumOf { keysOfName ->
            val schemas = keysOfName.mapNotNull { it.schema }.distinct()
            val hasKeyWithoutSchema = keysOfName.any { it.schema == null }
            schemas.size + if (hasKeyWithoutSchema && schemas.size != 1) 1 else 0
        }
    }
}
