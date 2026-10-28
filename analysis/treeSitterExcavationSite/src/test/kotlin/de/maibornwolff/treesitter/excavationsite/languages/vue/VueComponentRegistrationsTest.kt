package de.maibornwolff.treesitter.excavationsite.languages.vue

import de.maibornwolff.treesitter.excavationsite.api.ComponentRegistration
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class VueComponentRegistrationsTest {
    @Test
    fun `should read the global registrations of a TypeScript source`() {
        // Arrange
        val code = """
            import { createApp } from 'vue'
            import CreatureBadge from './CreatureBadge.vue'
            const app = createApp({})
            app.component('CreatureBadge', CreatureBadge)
            createApp({}).component("creature-card", CreatureBadge)
            app.component(name, CreatureBadge)
        """.trimIndent()

        // Act
        val registrations = TreeSitterDependencies.vueComponentRegistrations(code, Language.TYPESCRIPT)

        // Assert
        assertThat(registrations).containsExactly(
            ComponentRegistration("CreatureBadge", "CreatureBadge", isGlobal = true),
            ComponentRegistration("creature-card", "CreatureBadge", isGlobal = true)
        )
    }

    @Test
    fun `should read the components option of a Vue component's plain script`() {
        // Arrange
        val code = """
            <script lang="ts">
            import Card from './Card.vue'
            import Other from './Other.vue'
            export default defineComponent({ components: { CreatureCard: Card, Other, 'kebab-card': Card }, data() { return {} } })
            </script>
            <template><creature-card /></template>
        """.trimIndent()

        // Act
        val registrations = TreeSitterDependencies.vueComponentRegistrations(code, Language.VUE)

        // Assert
        assertThat(registrations).containsExactly(
            ComponentRegistration("CreatureCard", "Card", isGlobal = false),
            ComponentRegistration("Other", "Other", isGlobal = false),
            ComponentRegistration("kebab-card", "Card", isGlobal = false)
        )
    }

    @Test
    fun `should read no components option of an object that is not the default export`() {
        // Arrange
        val code = "export const options = { components: { Card } }"

        // Act
        val registrations = TreeSitterDependencies.vueComponentRegistrations(code, Language.JAVASCRIPT)

        // Assert
        assertThat(registrations).isEmpty()
    }
}
