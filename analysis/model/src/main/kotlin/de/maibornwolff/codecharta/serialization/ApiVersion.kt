package de.maibornwolff.codecharta.serialization

/** The `.cc.json` wire-format versions the (de)serialization layer can read and write. */
enum class ApiVersion(val versionString: String, val major: Int) {
    ONE_FIVE("1.5", 1),
    TWO_ZERO("2.0", 2)
}
