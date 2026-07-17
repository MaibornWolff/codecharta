package de.maibornwolff.codecharta.analysers.parsers.domainlanguage

/**
 * Splits a file path into its components, handling both Unix and Windows separators.
 *
 * @param path The file path to split
 * @return List of path components
 */
fun splitPath(path: String): List<String> = path.split('/', '\\').filter { it.isNotEmpty() }

/**
 * Joins path components with forward slashes for consistent output.
 *
 * @param parts The path components to join
 * @return The joined path using forward slashes
 */
fun joinPath(vararg parts: String): String = parts.filter { it.isNotEmpty() }.joinToString("/")

/**
 * Normalizes a path to use forward slashes.
 *
 * @param path The path to normalize
 * @return The normalized path with forward slashes
 */
fun normalizePath(path: String): String = path.replace('\\', '/')
