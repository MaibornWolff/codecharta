package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.javascript.JavascriptAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test

class JavascriptAnalyzerTest {
    @Test
    fun `should convert exported ES6 class to node with type CLASS`() {
        // given
        val javascriptCode = """
            export class MyGreatClass {}
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "TestClass.js",
                javascriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.CLASS, Path(listOf("TestClass", "MyGreatClass")))
            )
    }

    @Test
    fun `should convert exported ES6 function to node with type FUNCTION`() {
        // given
        val javascriptCode = """
            export function myGreatFunction() {}
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "TestClass.js",
                javascriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.FUNCTION, Path(listOf("TestClass", "myGreatFunction")))
            )
    }

    @Test
    fun `should convert exported ES6 const to node with type VARIABLE`() {
        // given
        val javascriptCode = """
            export const MY_CONSTANT = "value"
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "TestClass.js",
                javascriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.VARIABLE, Path(listOf("TestClass", "MY_CONSTANT")))
            )
    }

    @Test
    fun `should add ES6 named imports to dependencies`() {
        // given
        val javascriptCode = """
            import { MyClass, MyFunction } from './MyModule'

            export class MyGreatClass extends MyClass {}
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "MyDirectory/MyGreatClass.js",
                javascriptCode
            )
        ).analyze()

        // then
        val expectedDependencies = listOf(
            Dependency(path = Path(listOf("MyDirectory", "MyModule", "MyClass"))),
            Dependency(path = Path(listOf("MyDirectory", "MyModule", "MyFunction")))
        )
        val node = report.nodes[0]
        assertThat(node.dependencies).containsAll(expectedDependencies)
    }

    @Test
    fun `should add ES6 default import to dependencies`() {
        // given
        val javascriptCode = """
            import MyModule from './MyModule'

            export class MyGreatClass extends MyModule {}
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "MyDirectory/MyGreatClass.js",
                javascriptCode
            )
        ).analyze()

        // then
        // The default import binds the module's default export to `MyModule`; the dependency must end
        // in that binding name so it can resolve to the exported declaration, not the DEFAULT_EXPORT marker.
        val expectedDependency = Dependency(
            path = Path(listOf("MyDirectory", "MyModule", "MyModule"))
        )
        val node = report.nodes[0]
        assertThat(node.dependencies).contains(expectedDependency)
        assertThat(node.dependencies).noneMatch { it.path.parts.last() == "DEFAULT_EXPORT" }
    }

    @Test
    fun `should handle CommonJS require`() {
        // given
        val javascriptCode = """
            const MyModule = require('./MyModule')

            class MyGreatClass extends MyModule {}
            module.exports = MyGreatClass
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "MyDirectory/MyGreatClass.js",
                javascriptCode
            )
        ).analyze()

        // then
        // A default `require` binds the module to `MyModule`; the dependency resolves under that name.
        val expectedDependency = Dependency(
            path = Path(listOf("MyDirectory", "MyModule", "MyModule"))
        )
        val node = report.nodes[0]
        assertThat(node.dependencies).contains(expectedDependency)
    }

    @Test
    fun `should handle CommonJS destructured require`() {
        // given
        val javascriptCode = """
            const { MyClass, MyFunction } = require('./MyModule')

            class MyGreatClass extends MyClass {}
            module.exports = MyGreatClass
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "MyDirectory/MyGreatClass.js",
                javascriptCode
            )
        ).analyze()

        // then
        val expectedDependencies = listOf(
            Dependency(path = Path(listOf("MyDirectory", "MyModule", "MyClass"))),
            Dependency(path = Path(listOf("MyDirectory", "MyModule", "MyFunction")))
        )
        val node = report.nodes[0]
        assertThat(node.dependencies).containsAll(expectedDependencies)
    }

    @Test
    fun `should handle CommonJS module exports`() {
        // given
        val javascriptCode = """
            class MyGreatClass {}
            module.exports = MyGreatClass
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "TestClass.js",
                javascriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.CLASS, Path(listOf("TestClass", "MyGreatClass")))
            )
    }

    @Test
    fun `should handle CommonJS named exports`() {
        // given
        val javascriptCode = """
            function myFunction() {}
            exports.myFunction = myFunction
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "TestClass.js",
                javascriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.FUNCTION, Path(listOf("TestClass", "myFunction")))
            )
    }

    @Test
    @Disabled(
        "Inline CommonJS named exports (exports.x = <expr>) not yet supported by TSE dependency analysis - DeclarationExtractor does not parse exports-property assignments; was handled by the removed JavascriptCommonJsExportsQuery"
    )
    fun `should capture inline CommonJS named export without a separate declaration`() {
        // given - the export binding is the ONLY source of the name; unlike the test above there
        // is no standalone `function compute` declaration to mask a dropped `exports.x = ...` export
        val javascriptCode = """
            exports.compute = function () {
              return 42
            }
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "TestClass.js",
                javascriptCode
            )
        ).analyze()

        // then - the inline named export must still surface as a node
        val nodeNames = report.nodes.map { it.pathWithName.parts.last() }
        assertThat(nodeNames).contains("compute")
    }

    @Test
    fun `should handle ES6 re-exports from index file`() {
        // Given
        val javascriptCode = """
            export { MyClass } from './MyClass'
            export { MyFunction } from './MyFunction'
        """.trimIndent()

        // When
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "MyDirectory/index.js",
                javascriptCode
            )
        ).analyze()

        // Then
        assertThat(report.nodes).hasSize(2)
        assertThat(report.nodes)
            .extracting("nodeType")
            .containsExactly(NodeType.REEXPORT, NodeType.REEXPORT)
    }

    @Test
    fun `should handle ES6 re-exports from non-index barrel file`() {
        // Given
        val javascriptCode = """
            export { default as validationMixin } from './mixins/validation.mixin'
            export { required, maxLength } from './validators'
            export { default as helperMixin } from './mixins/helper.mixin'
        """.trimIndent()

        // When
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "shared/utils.js",
                javascriptCode
            )
        ).analyze()

        // Then
        assertThat(report.nodes).hasSize(4)
        assertThat(report.nodes)
            .extracting("nodeType")
            .containsOnly(NodeType.REEXPORT)
    }

    @Test
    fun `should use alias name for re-exports with aliases`() {
        // Given
        val javascriptCode = """
            export { default as validationMixin } from './mixins/validation.mixin'
            export { foo as bar } from './fooModule'
        """.trimIndent()

        // When
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "shared/utils.js",
                javascriptCode
            )
        ).analyze()

        // Then
        assertThat(report.nodes).hasSize(2)
        val nodeNames = report.nodes.map { it.pathWithName.parts.last() }
        // Should use alias names, not original names
        assertThat(nodeNames).containsExactlyInAnyOrder("validationMixin", "bar")
        assertThat(nodeNames).doesNotContain("default", "foo")
    }

    @Test
    fun `should handle ES6 wildcard re-exports`() {
        // given
        val javascriptCode = """
            export * from './MyModule'
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "MyDirectory/index.js",
                javascriptCode
            )
        ).analyze()

        // then
        val expectedDependency = Dependency(
            path = Path(listOf("MyDirectory", "MyModule")),
            isWildcard = true
        )
        val node = report.nodes[0]
        assertThat(node.nodeType).isEqualTo(NodeType.REEXPORT)
        assertThat(node.dependencies).contains(expectedDependency)
    }

    @Test
    fun `should parse JSX files`() {
        // given
        val javascriptCode = """
            import React from 'react'

            export function MyComponent() {
                return <div>Hello World</div>
            }
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "MyComponent.jsx",
                javascriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.FUNCTION, Path(listOf("MyComponent", "MyComponent")))
            )
    }

    @Test
    fun `should handle mixed ES6 and CommonJS in dependencies`() {
        // given
        val javascriptCode = """
            import { ES6Class } from './ES6Module'
            const CommonJSClass = require('./CommonJSModule')

            export class MyClass extends ES6Class {}
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "MyDirectory/MyClass.js",
                javascriptCode
            )
        ).analyze()

        // then
        val expectedDependencies = listOf(
            Dependency(path = Path(listOf("MyDirectory", "ES6Module", "ES6Class"))),
            Dependency(path = Path(listOf("MyDirectory", "CommonJSModule", "CommonJSClass")))
        )
        val node = report.nodes[0]
        assertThat(node.dependencies).containsAll(expectedDependencies)
    }

    @Test
    fun `should handle ES6 namespace imports`() {
        // given
        val javascriptCode = """
            import * as MyModule from './MyModule'

            export class MyClass {}
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "MyDirectory/MyClass.js",
                javascriptCode
            )
        ).analyze()

        // then
        val expectedDependency = Dependency(
            path = Path(listOf("MyDirectory", "MyModule")),
            isWildcard = true
        )
        val node = report.nodes[0]
        assertThat(node.dependencies).contains(expectedDependency)
    }

    @Test
    fun `should resolve relative import paths`() {
        // given
        val javascriptCode = """
            import { MyClass } from '../parent/MyClass'

            export class MyGreatClass extends MyClass {}
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "MyDirectory/child/MyGreatClass.js",
                javascriptCode
            )
        ).analyze()

        // then
        val expectedDependency = Dependency(
            path = Path(listOf("MyDirectory", "parent", "MyClass", "MyClass"))
        )
        val node = report.nodes[0]
        assertThat(node.dependencies).contains(expectedDependency)
    }

    @Test
    @Disabled("Anonymous default exports not yet supported by TSE dependency analysis")
    fun `should handle default export of anonymous class`() {
        // given
        val javascriptCode = """
            export default class {}
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "TestClass.js",
                javascriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.CLASS, Path(listOf("TestClass", "default")))
            )
    }

    @Test
    @Disabled("Anonymous default exports not yet supported by TSE dependency analysis")
    fun `should handle default export of anonymous function`() {
        // given
        val javascriptCode = """
            export default function() {}
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "TestFunction.js",
                javascriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.FUNCTION, Path(listOf("TestFunction", "default")))
            )
    }

    @Test
    fun `should handle default export of declared identifier`() {
        // given
        val javascriptCode = """
            const buildFunction = () => {
              return "hello";
            };

            export default buildFunction;
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "module.js",
                javascriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.VARIABLE, Path(listOf("module", "buildFunction"))),
                tuple(NodeType.VARIABLE, Path(listOf("module", "default")))
            )
    }

    @Test
    fun `should handle exported const with arrow function and external imports`() {
        // given
        val javascriptCode = """
            import { moduleA, moduleB } from 'external-lib';
            import { CONFIG } from '../../shared/constants/config';

            export const validateData = (arg1, arg2, arg3, arg4, arg5, arg6) => {
              let valid = true;
              return valid;
            };

            export const createInstance = (container) => {
              return new moduleA.Instance();
            };
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "src/utils/helpers.js",
                javascriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactlyInAnyOrder(
                tuple(NodeType.VARIABLE, Path(listOf("src", "utils", "helpers", "validateData"))),
                tuple(NodeType.VARIABLE, Path(listOf("src", "utils", "helpers", "createInstance")))
            )

        val expectedDependencies = listOf(
            Dependency(path = Path(listOf("external-lib", "moduleA"))),
            Dependency(path = Path(listOf("external-lib", "moduleB"))),
            Dependency(path = Path(listOf("shared", "constants", "config", "CONFIG")))
        )
        val node = report.nodes[0]
        assertThat(node.dependencies).containsAll(expectedDependencies)
    }

    @Test
    fun `should handle export list syntax with declared constants`() {
        // given
        val javascriptCode = """
            const configObject = {
              key: undefined,
              value: undefined,
            };

            const settingsObject = {
              enabled: undefined,
            };

            export {
              configObject,
              settingsObject,
            };
        """.trimIndent()

        // when
        val report = JavascriptAnalyzer(
            FileInfo(
                SupportedLanguage.JAVASCRIPT,
                "config/data.js",
                javascriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactlyInAnyOrder(
                tuple(NodeType.VARIABLE, Path(listOf("config", "data", "configObject"))),
                tuple(NodeType.VARIABLE, Path(listOf("config", "data", "settingsObject")))
            )
    }
}
