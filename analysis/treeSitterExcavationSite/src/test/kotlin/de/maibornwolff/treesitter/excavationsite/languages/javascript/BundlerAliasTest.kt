package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.api.AliasPathStart
import de.maibornwolff.treesitter.excavationsite.api.BundlerAlias
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class BundlerAliasTest {
    @Test
    fun `should read a string alias of a CommonJS configuration as written`() {
        // Arrange
        val configuration = "module.exports = { resolve: { alias: { '@lib': './lib' } } }"

        // Act
        val aliases = TreeSitterDependencies.bundlerAliases(configuration)

        // Assert
        assertThat(aliases).containsExactly(BundlerAlias("@lib", listOf("./lib"), AliasPathStart.AS_WRITTEN))
    }

    @Test
    fun `should read the string arguments of path resolve with dirname as a path from the config directory`() {
        // Arrange
        val configuration = "export default { resolve: { alias: { '@': path.resolve(__dirname, 'src', \"app\") } } }"

        // Act
        val aliases = TreeSitterDependencies.bundlerAliases(configuration)

        // Assert
        assertThat(aliases).containsExactly(BundlerAlias("@", listOf("src", "app"), AliasPathStart.CONFIG_DIRECTORY))
    }

    @Test
    fun `should read path resolve without dirname as a path from the working directory`() {
        // Arrange
        val configuration = "module.exports = { resolve: { alias: { shared: path.resolve('packages', 'shared') } } }"

        // Act
        val aliases = TreeSitterDependencies.bundlerAliases(configuration)

        // Assert
        assertThat(aliases).containsExactly(BundlerAlias("shared", listOf("packages", "shared"), AliasPathStart.WORKING_DIRECTORY))
    }

    @Test
    fun `should read the aliases below configureWebpack when the configuration has none of its own`() {
        // Arrange
        val configuration = "module.exports = { configureWebpack: { resolve: { alias: { vue$: 'vue/dist/vue.esm.js' } } } }"

        // Act
        val aliases = TreeSitterDependencies.bundlerAliases(configuration)

        // Assert
        assertThat(aliases).containsExactly(BundlerAlias("vue$", listOf("vue/dist/vue.esm.js"), AliasPathStart.AS_WRITTEN))
    }

    @Test
    fun `should leave out an alias whose target is neither a string nor a call of path resolve`() {
        // Arrange
        val configuration = """
            module.exports = { resolve: { alias: {
                joined: path.join(__dirname, 'src'),
                template: `src`,
                number: 3,
                empty: path.resolve(__dirname),
                kept: 'src'
            } } }
        """.trimIndent()

        // Act
        val aliases = TreeSitterDependencies.bundlerAliases(configuration)

        // Assert
        assertThat(aliases.map { it.name }).containsExactly("kept")
    }

    @Test
    fun `should read no alias from a configuration that is wrapped in a call`() {
        // Arrange
        val configuration = "export default defineConfig({ resolve: { alias: { '@': '/src' } } })"

        // Act
        val aliases = TreeSitterDependencies.bundlerAliases(configuration)

        // Assert
        assertThat(aliases).isEmpty()
    }

    @Test
    fun `should not fall back to the default export when module exports is no object`() {
        // Arrange
        val configuration = "module.exports = config\nexport default { resolve: { alias: { a: 'b' } } }"

        // Act
        val aliases = TreeSitterDependencies.bundlerAliases(configuration)

        // Assert
        assertThat(aliases).isEmpty()
    }

    @Test
    fun `should not fall back to configureWebpack when the aliases of the configuration are no object`() {
        // Arrange
        val configuration = "module.exports = { resolve: { alias: [] }, configureWebpack: { resolve: { alias: { a: 'b' } } } }"

        // Act
        val aliases = TreeSitterDependencies.bundlerAliases(configuration)

        // Assert
        assertThat(aliases).isEmpty()
    }

    @Test
    fun `should read no alias from a configuration that does not parse`() {
        // Arrange
        val configuration = "module.exports = {"

        // Act
        val aliases = TreeSitterDependencies.bundlerAliases(configuration)

        // Assert
        assertThat(aliases).isEmpty()
    }
}
