package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue.VueAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class VueAnalyzerTest {
    @Test
    fun `should analyze a Vue SFC with a TypeScript script`() {
        // Arrange
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

        // Act
        val result = VueAnalyzer(fileInfo).analyze()

        // Assert
        assertThat(result.nodes).hasSize(1)
        val node = result.nodes.first()
        assertThat(node.pathWithName.toString()).isEqualTo("src.components.HelloWorld")
        assertThat(node.nodeType).isEqualTo(NodeType.CLASS)
        assertThat(node.language).isEqualTo(SupportedLanguage.VUE)
    }

    @Test
    fun `should analyze a Vue SFC with a JavaScript script`() {
        // Arrange
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

        // Act
        val result = VueAnalyzer(fileInfo).analyze()

        // Assert
        assertThat(result.nodes).hasSize(1)
        assertThat(
            result.nodes
                .first()
                .pathWithName
                .toString()
        ).isEqualTo("src.components.Message")
    }

    @Test
    fun `should analyze a Vue SFC with script setup syntax`() {
        // Arrange
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

        // Act
        val result = VueAnalyzer(fileInfo).analyze()

        // Assert
        assertThat(result.nodes).hasSize(1)
        assertThat(
            result.nodes
                .first()
                .pathWithName
                .toString()
        ).isEqualTo("src.components.Setup")
    }

    @Test
    fun `should analyze a template-only Vue component`() {
        // Arrange
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

        // Act
        val result = VueAnalyzer(fileInfo).analyze()

        // Assert
        assertThat(result.nodes).hasSize(1)
        val node = result.nodes.first()
        assertThat(node.pathWithName.toString()).isEqualTo("src.components.SimpleButton")
        assertThat(node.dependencies).isEmpty()
        assertThat(node.usedTypes).isEmpty()
    }

    @Test
    fun `should track imports from the script section`() {
        // Arrange
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

        // Act
        val result = VueAnalyzer(fileInfo).analyze()

        // Assert
        assertThat(result.nodes).hasSize(1)
        val node = result.nodes.first()
        assertThat(node.dependencies).isNotEmpty()
    }

    @Test
    fun `should track component usage from the template section`() {
        // Arrange
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

        // Act
        val result = VueAnalyzer(fileInfo).analyze()

        // Assert
        assertThat(result.nodes).hasSize(1)
        val node = result.nodes.first()
        assertThat(node.dependencies).isNotEmpty()
    }

    @Test
    fun `should handle a Vue SFC with a TSX script`() {
        // Arrange
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

        // Act
        val result = VueAnalyzer(fileInfo).analyze()

        // Assert
        assertThat(result.nodes).hasSize(1)
        assertThat(
            result.nodes
                .first()
                .pathWithName
                .toString()
        ).isEqualTo("src.components.TsxComponent")
    }

    @Test
    fun `should handle a Vue SFC with a JSX script`() {
        // Arrange
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

        // Act
        val result = VueAnalyzer(fileInfo).analyze()

        // Assert
        assertThat(result.nodes).hasSize(1)
        assertThat(
            result.nodes
                .first()
                .pathWithName
                .toString()
        ).isEqualTo("src.components.JsxComponent")
    }

    @Test
    fun `should track named imports from both module alias and relative paths`() {
        // Arrange
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

        // Act
        val result = VueAnalyzer(fileInfo).analyze()

        // Assert
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
    fun `should strip the vue extension from dependency paths to match node paths`() {
        // Arrange
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

        // Act
        val result = VueAnalyzer(fileInfo).analyze()

        // Assert
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
    fun `should resolve a script default import to its binding name instead of the DEFAULT_EXPORT marker`() {
        // Arrange
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

        // Act
        val result = VueAnalyzer(fileInfo).analyze()

        // Assert
        // The default import binds to TitleBuilder; both the dependency and the usedType must carry that
        // binding name so the dependency can resolve to the exported declaration, not a DEFAULT_EXPORT marker.
        val node = result.nodes.first()
        val dependencyPaths = node.dependencies.map { it.path.toString() }
        assertThat(dependencyPaths).anyMatch { it.endsWith("titleBuilder.TitleBuilder") }
        assertThat(dependencyPaths).noneMatch { it.endsWith("DEFAULT_EXPORT") }
        assertThat(node.usedTypes.map { it.name }).contains("TitleBuilder")
    }

    @Test
    fun `should analyse every script block of a component`() {
        // Arrange
        val vueCode = """
            <script lang="ts">
            import { Foo } from './Foo'
            export default { name: 'Pair' }
            </script>

            <script setup lang="ts">
            import { Bar } from './Bar'
            </script>
        """.trimIndent()
        val fileInfo = FileInfo(language = SupportedLanguage.VUE, physicalPath = "src/components/Pair.vue", content = vueCode)

        // Act
        val result = VueAnalyzer(fileInfo).analyze()

        // Assert
        val dependencyPaths = result.nodes.single().dependencies.map { it.path.withDots() }
        assertThat(dependencyPaths).anyMatch { it.startsWith("src.components.Foo") }
        assertThat(dependencyPaths).anyMatch { it.startsWith("src.components.Bar") }
    }

    @Test
    fun `should let a default import of a Vue file name its component, and a use of the binding name it in full`(
        @TempDir analysisRoot: File
    ) {
        // Arrange
        File(analysisRoot, "b").mkdirs()
        File(analysisRoot, "b/Badge.vue").writeText("<template><span>b</span></template>")
        val vueCode = """
            <template>
              <Badge />
            </template>

            <script setup lang="ts">
            import Badge from '../b/Badge.vue'
            </script>
        """.trimIndent()
        val fileInfo = FileInfo(SupportedLanguage.VUE, "views/Home.vue", vueCode, analysisRoot = analysisRoot)

        // Act
        val node = VueAnalyzer(fileInfo).analyze().nodes.single()

        // Assert
        assertThat(node.dependencies.map { it.path }).contains(Path(listOf("b", "Badge")))
        assertThat(node.usedTypes.map { it.name }).containsExactly("b.Badge")
    }

    @Test
    fun `should resolve a named import of a script block to the module file the compiler finds`(
        @TempDir analysisRoot: File
    ) {
        // Arrange
        File(analysisRoot, "application").mkdirs()
        File(analysisRoot, "application/index.ts").writeText("export { Facade } from './Facade'")
        val vueCode = """
            <script setup lang="ts">
            import { Facade } from '../application'
            </script>
        """.trimIndent()
        val fileInfo = FileInfo(SupportedLanguage.VUE, "ui/Stable.vue", vueCode, analysisRoot = analysisRoot)

        // Act
        val node = VueAnalyzer(fileInfo).analyze().nodes.single()

        // Assert
        assertThat(node.dependencies.map { it.path }).contains(Path(listOf("application", "index", "Facade")))
    }

    @Test
    fun `should count an import only where the script setup block or the template uses it`(
        @TempDir analysisRoot: File
    ) {
        // Arrange
        File(analysisRoot, "fmt.ts").writeText("export function format() {}\nexport const defaults = {}\nexport function unused() {}")
        File(analysisRoot, "components").mkdirs()
        val vueCode = """
            <template>
              <span :title="defaults.size">{{ format(date) }}</span>
            </template>

            <script setup lang="ts">
            import { defaults, format, unused } from '../fmt'

            const date = new Date()
            </script>
        """.trimIndent()
        val fileInfo = FileInfo(SupportedLanguage.VUE, "components/Item.vue", vueCode, analysisRoot = analysisRoot)

        // Act
        val node = VueAnalyzer(fileInfo).analyze().nodes.single()

        // Assert
        assertThat(node.usedTypes.map { it.name }).containsExactlyInAnyOrder("defaults", "format", "Date")
    }

    @Test
    fun `should let a script setup block see what the plain script block binds`() {
        // Arrange
        val vueCode = """
            <script lang="ts">
            import { format } from './fmt'
            export interface Props { size: number }
            </script>

            <script setup lang="ts">
            defineProps<Props>()
            const label = format('x')
            </script>
        """.trimIndent()
        val fileInfo = FileInfo(SupportedLanguage.VUE, "src/Comp.vue", vueCode)

        // Act
        val nodes = VueAnalyzer(fileInfo).analyze().nodes

        // Assert
        val component = nodes.single { it.pathWithName == Path(listOf("src", "Comp")) }
        assertThat(component.usedTypes.map { it.name }).containsExactlyInAnyOrder("src.Comp.Props", "format")
        assertThat(nodes.map { it.pathWithName.withDots() }).containsExactlyInAnyOrder("src.Comp", "src.Comp.Props")
    }

    @Test
    fun `should make the declaration a plain script exports as default the component itself`() {
        // Arrange
        val vueCode = """
            <script lang="ts">
            import { B } from './b'
            export default class Comp { b?: B }
            </script>
            <template><div/></template>
        """.trimIndent()
        val fileInfo = FileInfo(SupportedLanguage.VUE, "src/Comp.vue", vueCode)

        // Act
        val nodes = VueAnalyzer(fileInfo).analyze().nodes

        // Assert
        val component = nodes.single()
        assertThat(component.pathWithName).isEqualTo(Path(listOf("src", "Comp")))
        assertThat(component.usedTypes.map { it.name }).containsExactly("B")
    }
}
