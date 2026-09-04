package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.splitNameToParts

fun String.replaceDots() = this.replace(".", "_")

private const val UNKNOWN = "<unknown>"

class Path {
    val parts: List<String>
    private var aliases: List<Path> = emptyList()

    constructor(parts: List<String>) {
        this.parts = parts.map { it.replaceDots() }
    }

    constructor(vararg parts: String) : this(parts.toList().map { it.replaceDots() })

    operator fun plus(it: String): Path = Path(parts + it)

    operator fun plus(it: List<String>): Path = Path(parts.union(it).toList())

    operator fun plus(it: Path): Path = Path(parts + it.parts)

    fun withoutName() = parts.slice(0 until parts.lastIndex)

    fun with(separator: String) = parts.joinToString(separator) { it.replace(".", "_") }

    fun withDots() = with(".")

    fun withUnderscores() = with("_")

    fun getName() = parts.lastOrNull()?.replace("_", ".") ?: UNKNOWN

    fun hasOnlyName(): Boolean = parts.size == 1

    fun isEmpty(): Boolean = parts.isEmpty() || (parts.size == 1 && parts[0].trim().isEmpty())

    companion object {
        fun unknown(type: String) = Path(listOf(UNKNOWN, type))

        fun fromStringWithDots(withDots: String) = Path(withDots.split("."))

        fun fromPhysicalPath(physicalPath: String) = Path(splitNameToParts(physicalPath))

        fun empty() = Path(emptyList())
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Path

        return parts == other.parts
    }

    override fun hashCode(): Int = parts.hashCode()

    override fun toString(): String = withDots()

    fun withAlias(alias: Path): Path {
        aliases = aliases + alias
        return this
    }

    fun hasAlias(alias: Path): Boolean = aliases.contains(alias)
}
