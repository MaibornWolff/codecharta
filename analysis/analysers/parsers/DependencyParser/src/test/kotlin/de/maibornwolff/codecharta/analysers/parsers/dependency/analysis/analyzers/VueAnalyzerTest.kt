package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue.VueAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class VueAnalyzerTest {
    @Test
    fun `analyzes Vue SFC with TypeScript script`() {
        // Given
        val vueCode = """
            <template>
              <div>Hello World</div>
            </template>

            <script lang="ts">
            import { defineComponent } from 'vue'

            export default defineComponent({
              name: 'HelloWorld'
            })
            </script>

            <style scoped>
            div { color: blue; }
            </style>
        """.trimIndent()

        val fileInfo = FileInfo(
            language = SupportedLanguage.VUE,
            physicalPath = "src/components/HelloWorld.vue",
            content = vueCode
        )

        // When
        val result = VueAnalyzer(fileInfo).analyze()

        // Then
        assertThat(result.nodes).hasSize(1)
        val node = result.nodes.first()
        assertThat(node.pathWithName.toString()).isEqualTo("src.components.HelloWorld")
        assertThat(node.nodeType).isEqualTo(NodeType.CLASS)
        assertThat(node.language).isEqualTo(SupportedLanguage.VUE)
    }

    @Test
    fun `analyzes Vue SFC with JavaScript script`() {
        // Given
        val vueCode = """
            <template>
              <div>{{ message }}</div>
            </template>

            <script>
            export default {
              data() {
                return {
                  message: 'Hello'
                }
              }
            }
            </script>
        """.trimIndent()

        val fileInfo = FileInfo(
            language = SupportedLanguage.VUE,
            physicalPath = "src/components/Message.vue",
            content = vueCode
        )

        // When
        val result = VueAnalyzer(fileInfo).analyze()

        // Then
        assertThat(result.nodes).hasSize(1)
        assertThat(
            result.nodes
                .first()
                .pathWithName
                .toString()
        ).isEqualTo("src.components.Message")
    }

    @Test
    fun `analyzes Vue SFC with script setup syntax`() {
        // Given
        val vueCode = """
            <template>
              <div>{{ message }}</div>
            </template>

            <script setup lang="ts">
            import { ref } from 'vue'

            const message = ref('Hello')
            </script>
        """.trimIndent()

        val fileInfo = FileInfo(
            language = SupportedLanguage.VUE,
            physicalPath = "src/components/Setup.vue",
            content = vueCode
        )

        // When
        val result = VueAnalyzer(fileInfo).analyze()

        // Then
        assertThat(result.nodes).hasSize(1)
        assertThat(
            result.nodes
                .first()
                .pathWithName
                .toString()
        ).isEqualTo("src.components.Setup")
    }

    @Test
    fun `analyzes template-only Vue component`() {
        // Given
        val vueCode = """
            <template>
              <button class="btn">Click me</button>
            </template>

            <style scoped>
            .btn { color: blue; }
            </style>
        """.trimIndent()

        val fileInfo = FileInfo(
            language = SupportedLanguage.VUE,
            physicalPath = "src/components/SimpleButton.vue",
            content = vueCode
        )

        // When
        val result = VueAnalyzer(fileInfo).analyze()

        // Then
        assertThat(result.nodes).hasSize(1)
        val node = result.nodes.first()
        assertThat(node.pathWithName.toString()).isEqualTo("src.components.SimpleButton")
        assertThat(node.dependencies).isEmpty()
        assertThat(node.usedTypes).isEmpty()
    }

    @Test
    fun `tracks imports from script section`() {
        // Given
        val vueCode = """
            <template>
              <div>Content</div>
            </template>

            <script lang="ts">
            import { defineComponent } from 'vue'
            import ChildComponent from './ChildComponent.vue'
            import { helper } from './utils'

            export default defineComponent({
              components: { ChildComponent }
            })
            </script>
        """.trimIndent()

        val fileInfo = FileInfo(
            language = SupportedLanguage.VUE,
            physicalPath = "src/components/Parent.vue",
            content = vueCode
        )

        // When
        val result = VueAnalyzer(fileInfo).analyze()

        // Then
        assertThat(result.nodes).hasSize(1)
        val node = result.nodes.first()
        assertThat(node.dependencies).isNotEmpty()
    }

    @Test
    fun `tracks component usage from template section`() {
        // Given
        val vueCode = """
            <template>
              <div>
                <UserAvatar :user="user" />
                <UserBadge :level="user.level" />
              </div>
            </template>

            <script setup lang="ts">
            import { ref } from 'vue'
            import UserAvatar from './UserAvatar.vue'
            // Note: UserBadge not imported (globally registered)

            const user = ref({ name: 'John', level: 5 })
            </script>
        """.trimIndent()

        val fileInfo = FileInfo(
            language = SupportedLanguage.VUE,
            physicalPath = "src/components/UserProfile.vue",
            content = vueCode
        )

        // When
        val result = VueAnalyzer(fileInfo).analyze()

        // Then
        assertThat(result.nodes).hasSize(1)
        val node = result.nodes.first()
        assertThat(node.dependencies).isNotEmpty()
    }

    @Test
    fun `handles Vue SFC with TSX script`() {
        // Given
        val vueCode = """
            <script lang="tsx">
            import { defineComponent } from 'vue'
            import ChildComponent from './ChildComponent.vue'

            export default defineComponent({
              render() {
                return <div><ChildComponent /></div>
              }
            })
            </script>
        """.trimIndent()

        val fileInfo = FileInfo(
            language = SupportedLanguage.VUE,
            physicalPath = "src/components/TsxComponent.vue",
            content = vueCode
        )

        // When
        val result = VueAnalyzer(fileInfo).analyze()

        // Then
        assertThat(result.nodes).hasSize(1)
        assertThat(
            result.nodes
                .first()
                .pathWithName
                .toString()
        ).isEqualTo("src.components.TsxComponent")
    }

    @Test
    fun `handles Vue SFC with JSX script`() {
        // Given
        val vueCode = """
            <script lang="jsx">
            import ChildComponent from './ChildComponent.vue'

            export default {
              render() {
                return <div><ChildComponent /></div>
              }
            }
            </script>
        """.trimIndent()

        val fileInfo = FileInfo(
            language = SupportedLanguage.VUE,
            physicalPath = "src/components/JsxComponent.vue",
            content = vueCode
        )

        // When
        val result = VueAnalyzer(fileInfo).analyze()

        // Then
        assertThat(result.nodes).hasSize(1)
        assertThat(
            result.nodes
                .first()
                .pathWithName
                .toString()
        ).isEqualTo("src.components.JsxComponent")
    }

    @Test
    fun `tracks named imports from both module alias and relative paths`() {
        // Given
        val vueCode = """
            <template>
              <div>
                <DropdownComponent />
              </div>
            </template>

            <script>
            import { validateMixin, formatMixin } from 'SharedLibrary/mixins';
            import DropdownComponent from '../components/Dropdown.vue';

            export default {
              name: 'FormComponent',
              components: { DropdownComponent },
              mixins: [validateMixin, formatMixin]
            }
            </script>
        """.trimIndent()

        val fileInfo = FileInfo(
            language = SupportedLanguage.VUE,
            physicalPath = "src/forms/FormComponent.vue",
            content = vueCode
        )

        // When
        val result = VueAnalyzer(fileInfo).analyze()

        // Then
        assertThat(result.nodes).hasSize(1)
        val node = result.nodes.first()

        // Both imports should produce usedTypes entries
        val usedTypeNames = node.usedTypes.map { it.name }

        // Module alias import should create usedTypes for the named imports
        assertThat(usedTypeNames).contains("validateMixin")
        assertThat(usedTypeNames).contains("formatMixin")

        // Relative import should create usedType for the default import
        assertThat(usedTypeNames).contains("DropdownComponent")
    }

    @Test
    fun `strips vue extension from dependency paths to match node paths`() {
        // Given
        val vueCode = """
            <template>
              <div>
                <ChildComponent />
              </div>
            </template>

            <script>
            import ChildComponent from '../ChildComponent.vue';

            export default {
              name: 'ParentComponent',
              components: {
                ChildComponent
              }
            }
            </script>
        """.trimIndent()

        val fileInfo = FileInfo(
            language = SupportedLanguage.VUE,
            physicalPath = "src/parent/ParentComponent.vue",
            content = vueCode
        )

        // When
        val result = VueAnalyzer(fileInfo).analyze()

        // Then
        assertThat(result.nodes).hasSize(1)
        val node = result.nodes.first()
        assertThat(node.pathWithName.toString()).isEqualTo("src.parent.ParentComponent")

        val dependencyPaths = node.dependencies.map { it.path.toString() }

        // The dependency should NOT include .vue extension to match the node path
        // And should include the full path resolved from the relative import
        assertThat(dependencyPaths).anyMatch {
            it.endsWith("ChildComponent") && !it.contains(".vue")
        }
    }

    @Test
    fun `resolves a script default import to its binding name instead of the DEFAULT_EXPORT marker`() {
        // Given
        val vueCode = """
            <template>
              <div>{{ title }}</div>
            </template>

            <script lang="ts">
            import TitleBuilder from './util/titleBuilder'

            export default {
              computed: { title() { return new TitleBuilder().build() } }
            }
            </script>
        """.trimIndent()

        val fileInfo = FileInfo(
            language = SupportedLanguage.VUE,
            physicalPath = "src/widgets/Header.vue",
            content = vueCode
        )

        // When
        val result = VueAnalyzer(fileInfo).analyze()

        // Then
        // The default import binds to TitleBuilder; both the dependency and the usedType must carry that
        // binding name so the dependency can resolve to the exported declaration, not a DEFAULT_EXPORT marker.
        val node = result.nodes.first()
        val dependencyPaths = node.dependencies.map { it.path.toString() }
        assertThat(dependencyPaths).anyMatch { it.endsWith("titleBuilder.TitleBuilder") }
        assertThat(dependencyPaths).noneMatch { it.endsWith("DEFAULT_EXPORT") }
        assertThat(node.usedTypes.map { it.name }).contains("TitleBuilder")
    }
}
