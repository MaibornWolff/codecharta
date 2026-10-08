package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * A module alias of a bundler configuration, such as `'@': path.resolve(__dirname, 'src')` in `resolve.alias`.
 *
 * @property pathParts the string literal of the alias, or the string arguments of `path.resolve` in their order
 */
data class BundlerAlias(val name: String, val pathParts: List<String>, val pathStart: AliasPathStart)

enum class AliasPathStart {
    /** A string literal: the single path part is the target as written. */
    AS_WRITTEN,

    /** `path.resolve` with `__dirname` among its arguments: the parts are joined from the directory of the file. */
    CONFIG_DIRECTORY,

    /** `path.resolve` without `__dirname`: the parts are joined from the working directory. */
    WORKING_DIRECTORY
}
