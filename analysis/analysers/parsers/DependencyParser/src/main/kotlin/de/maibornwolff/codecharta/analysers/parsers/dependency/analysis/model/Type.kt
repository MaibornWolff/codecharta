package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

data class Type(val name: String, val usageSource: TypeOfUsage, val genericTypes: List<Type>, val resolvedPath: Path? = null) {
    companion object {
        fun generic(name: String, genericTypes: List<Type>) = Type(name.trim(), TypeOfUsage.USAGE, genericTypes)

        fun generic(name: String, genericTypes: List<Type>, typeOfUsage: TypeOfUsage) = Type(name.trim(), typeOfUsage, genericTypes)

        fun simple(name: String) = Type(name.trim(), TypeOfUsage.USAGE, listOf())

        fun simple(name: String, typeOfUsage: TypeOfUsage) = Type(name.trim(), typeOfUsage, listOf())

        fun unparsable() = Type("unparsable_type_in_analysis", TypeOfUsage.USAGE, listOf())
    }

    fun isUppercase() = name.firstOrNull()?.isUpperCase() ?: false

    fun containedTypes(): List<Type> = genericTypes.flatMap { it.containedTypes() } + this

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Type

        if (name != other.name) return false
        if (genericTypes != other.genericTypes) return false
        if (resolvedPath != other.resolvedPath) return false

        return true
    }

    override fun hashCode(): Int {
        var result = name.hashCode()
        result = 31 * result + genericTypes.hashCode()
        result = 31 * result + (resolvedPath?.hashCode() ?: 0)
        return result
    }

    override fun toString(): String {
        if (genericTypes.isEmpty()) return name
        return "$name$genericTypes"
    }
}
