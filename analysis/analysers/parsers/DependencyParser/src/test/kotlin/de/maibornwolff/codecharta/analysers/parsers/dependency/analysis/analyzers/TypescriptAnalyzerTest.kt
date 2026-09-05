package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.TypescriptAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Assumptions.assumeTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class TypescriptAnalyzerTest {
    @Test
    fun `should convert path to correct path with names`() {
        // given
        val typescriptCode = """            
            export class Person {
                private name: string
                private age: number
            }
        """.trimIndent()
        val physicalPath = File("MyExample/Path/TypescriptAnalyzerTest.ts").path

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                physicalPath,
                typescriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes).extracting("pathWithName").containsExactly(
            Path(listOf("MyExample", "Path", "TypescriptAnalyzerTest", "Person"))
        )
    }

    @Test
    fun `should convert exported class to node with type CLASS`() {
        // given
        val typescriptCode = """            
            export class MyGreatClass {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "TestClass.ts",
                typescriptCode
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
    fun `should convert exported function to node with type FUNCTION`() {
        // given
        val typescriptCode = """            
            export function myGreatFunction() {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "TestClass.ts",
                typescriptCode
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
    fun `should convert exported interface to node with type INTERFACE`() {
        // given
        val typescriptCode = """            
            export interface MyGreatInterface {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "TestClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.INTERFACE, Path(listOf("TestClass", "MyGreatInterface")))
            )
    }

    @Test
    fun `should convert exported enum to node with type ENUM`() {
        // given
        val typescriptCode = """            
            export enum MyGreatEnum {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "TestClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.ENUM, Path(listOf("TestClass", "MyGreatEnum")))
            )
    }

    @Test
    fun `should convert exported type to node with type CLASS`() {
        // given
        val typescriptCode = """            
            export type MyGreatType = {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "TestClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.CLASS, Path(listOf("TestClass", "MyGreatType")))
            )
    }

    @Test
    fun `should convert exported variable to node with type VARIABLE`() {
        // given
        val typescriptCode = """            
            export var myGreatVariable = ""
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "TestClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.VARIABLE, Path(listOf("TestClass", "myGreatVariable")))
            )
    }

    @Test
    fun `should convert exported constant to node with type VARIABLE`() {
        // given
        val typescriptCode = """            
            export const MY_GREAT_CONSTANT = ""
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "TestClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.VARIABLE, Path(listOf("TestClass", "MY_GREAT_CONSTANT")))
            )
    }

    @Test
    fun `should add named imports to dependencies of a node`() {
        // given
        val typescriptCode = """
            import { MyGreatInterface, AnotherGreatInterface } from './MyGreatInterface';
            
            export class MyGreatClass implements MyGreatInterface {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyGreatClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val expectedDependencies = listOf(
            Dependency(
                path = Path(listOf("MyDirectory", "MyGreatInterface", "MyGreatInterface"))
            ),
            Dependency(
                path = Path(listOf("MyDirectory", "MyGreatInterface", "AnotherGreatInterface"))
            )
        )
        val node = report.nodes[0]
        assertThat(node.dependencies).containsAll(expectedDependencies)
    }

    @Test
    fun `should add default import to dependencies of a node`() {
        // given
        val typescriptCode = """
            import MyGreatInterface from 'MyGreatInterface';

            export class MyGreatClass implements MyGreatInterface {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "TestClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        // A default import (`import Foo from './bar'`) binds the imported default export to the
        // local name `Foo`. The dependency must end in that binding name so it can resolve to the
        // exported declaration (which is keyed by its real name), not the internal DEFAULT_EXPORT marker.
        val expectedDependency = Dependency(
            path = Path(listOf("MyGreatInterface", "MyGreatInterface"))
        )
        val node = report.nodes[0]
        assertThat(node.dependencies).contains(expectedDependency)
        assertThat(node.dependencies).noneMatch { it.path.parts.last() == "DEFAULT_EXPORT" }
        assertThat(node.usedTypes).containsExactly(
            Type.simple("MyGreatInterface")
        )
    }

    @Test
    fun `should resolve default import used as a base class to the exported declaration`() {
        // given
        val typescriptCode = """
            import BoundingBox from './boundingBox';

            export default class House extends BoundingBox {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "street/house.ts",
                typescriptCode
            )
        ).analyze()

        // then
        // The dependency must point at street/boundingBox/BoundingBox - the real exported class -
        // so it matches the BoundingBox declaration's node during dependency resolution.
        val node = report.nodes.first { it.usedTypes.contains(Type.simple("BoundingBox")) }
        assertThat(node.dependencies).contains(
            Dependency(path = Path(listOf("street", "boundingBox", "BoundingBox")))
        )
        assertThat(node.dependencies).noneMatch { it.path.parts.last() == "DEFAULT_EXPORT" }
    }

    @Test
    fun `should resolve relative import on same directory`() {
        // given
        val typescriptCode = """
            import { MyGreatInterface } from './MyGreatInterface';
            
            export class MyGreatClass implements MyGreatInterface {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyGreatClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val expectedDependency = Dependency(
            path = Path(listOf("MyDirectory", "MyGreatInterface", "MyGreatInterface"))
        )
        val expectedType = Type.simple("MyGreatInterface")
        val node = report.nodes[0]
        assertThat(node.dependencies).contains(expectedDependency)
        assertThat(node.usedTypes).containsExactly(expectedType)
    }

    @Test
    fun `should resolve relative import on nested directory`() {
        // given
        val typescriptCode = """
            import { MyGreatInterface } from '../MyGreatInterface';
            
            export class MyGreatClass implements MyGreatInterface {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyRoot/MyDirectory/MyGreatClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val expectedDependency = Dependency(
            path = Path(listOf("MyRoot", "MyGreatInterface", "MyGreatInterface"))
        )
        val expectedType = Type.simple("MyGreatInterface")
        val node = report.nodes[0]
        assertThat(node.dependencies).contains(expectedDependency)
        assertThat(node.usedTypes).containsExactly(expectedType)
    }

    @Test
    fun `should trim file endings in imports`() {
        // given
        val typescriptCode = """
            import { MyGreatInterface } from 'MyGreatInterface.ts';
            
            export class MyGreatClass implements MyGreatInterface {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyGreatClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val expectedDependency = Dependency(
            path = Path(listOf("MyGreatInterface", "MyGreatInterface"))
        )
        val node = report.nodes[0]
        assertThat(node.dependencies).contains(expectedDependency)
    }

    @Test
    fun `should handle index ts`() {
        // given
        val typescriptCode = """
             export { MyReexportedClass } from './MyInternalClass'
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/index.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val expectedDependency = Dependency(
            path = Path(listOf("MyDirectory", "MyInternalClass", "MyReexportedClass"))
        )
        val node = report.nodes[0]
        assertThat(node.pathWithName).isEqualTo(Path(listOf("MyDirectory", "index", "MyReexportedClass")))
        assertThat(node.dependencies).contains(expectedDependency)
        assertThat(node.usedTypes).containsExactly(Type.simple("MyReexportedClass"))
    }

    @Test
    fun `should handle multiple reexports of same file in index ts`() {
        // given
        val typescriptCode = """
             export { AClass, AnotherClass } from './MyInternalModule'
             export { AThirdClass } from './AnotherInternalModule'
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/index.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val expectedDependency1 = Dependency(path = Path(listOf("MyDirectory", "MyInternalModule", "AClass")))
        val expectedDependency2 = Dependency(path = Path(listOf("MyDirectory", "MyInternalModule", "AnotherClass")))
        val expectedDependency3 = Dependency(path = Path(listOf("MyDirectory", "AnotherInternalModule", "AThirdClass")))

        assertThat(report.nodes).hasSize(3)
        val nodeOfAClass = report.nodes[0]
        assertThat(nodeOfAClass.dependencies).contains(expectedDependency1)
        assertThat(nodeOfAClass.dependencies).doesNotContain(expectedDependency2, expectedDependency3)
        assertThat(nodeOfAClass.usedTypes).containsExactly(Type.simple("AClass"))

        val nodeOfAnotherClass = report.nodes[1]
        assertThat(nodeOfAnotherClass.dependencies).contains(expectedDependency2)
        assertThat(nodeOfAnotherClass.dependencies).doesNotContain(expectedDependency1, expectedDependency3)
        assertThat(nodeOfAnotherClass.usedTypes).containsExactly(Type.simple("AnotherClass"))

        val nodeOfAThirdClass = report.nodes[2]
        assertThat(nodeOfAThirdClass.dependencies).contains(expectedDependency3)
        assertThat(nodeOfAThirdClass.dependencies).doesNotContain(expectedDependency1, expectedDependency2)
        assertThat(nodeOfAThirdClass.usedTypes).containsExactly(Type.simple("AThirdClass"))
    }

    @Test
    fun `should keep dependency for aliased named re-export`() {
        // Given - a named re-export that renames the imported binding: the source module's `Foo`
        // is re-exported locally as `Bar`
        val typescriptCode = """
            export { Foo as Bar } from './MyModule'
        """.trimIndent()

        // When
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/index.ts",
                typescriptCode
            )
        ).analyze()

        // Then - the re-export node is named after the alias `Bar` but must still depend on the
        // source module's original `Foo` binding (selectImports filters imports by re-export name,
        // so a mismatch between the alias and the imported name would silently drop this edge)
        val node = report.nodes.first { it.pathWithName.parts.last() == "Bar" }
        assertThat(node.dependencies).contains(
            Dependency(path = Path(listOf("MyDirectory", "MyModule", "Foo")))
        )
    }

    @Test
    fun `should handle reexports from non-index barrel file`() {
        // Given
        val typescriptCode = """
            export { default as validationMixin } from './mixins/validation.mixin'
            export { required, maxLength } from './validators'
            export { default as helperMixin } from './mixins/helper.mixin'
        """.trimIndent()

        // When
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "shared/utils.ts",
                typescriptCode
            )
        ).analyze()

        // Then
        assertThat(report.nodes).hasSize(4)
        assertThat(report.nodes)
            .extracting("nodeType")
            .containsOnly(NodeType.REEXPORT)
    }

    @Test
    fun `should add implicit dependency on index`() {
        // given
        val typescriptCode = """
            import { MyGreatInterface } from 'MyGreatInterface';
            
            export class MyGreatClass implements MyGreatInterface {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "TestClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val expectedDependencies = listOf(
            Dependency(path = Path(listOf("MyGreatInterface", "MyGreatInterface"))),
            Dependency(path = Path(listOf("MyGreatInterface", "index", "MyGreatInterface")))
        )
        val expectedType = Type.simple("MyGreatInterface")
        val node = report.nodes[0]
        assertThat(node.dependencies).containsAll(expectedDependencies)
        assertThat(node.usedTypes).containsExactly(expectedType)
    }

    @Test
    fun `resulting node should be named after alias`() {
        val typescriptCode = """
             export { MyReexportedClass as MRC } from './MyInternalClass'
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/index.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val expectedDependency = Dependency(
            path = Path(listOf("MyDirectory", "MyInternalClass", "MyReexportedClass"))
        )
        val node = report.nodes[0]
        assertThat(node.pathWithName).isEqualTo(Path(listOf("MyDirectory", "index", "MRC")))
        assertThat(node.dependencies).contains(expectedDependency)
        assertThat(node.usedTypes).containsExactly(Type.simple("MyReexportedClass"))
    }

    @Test
    fun `should add used type identifiers to usedTypes of a Node`() {
        // given
        val typescriptCode = """
            export class MyClass {
                private myType: MyType
            }
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val node = report.nodes[0]
        assertThat(node.usedTypes).contains(Type.simple("MyType"))
    }

    @Test
    fun `should only include types that are used in a Node in it`() {
        // given
        val typescriptCode = """
            export class MyFirstClass {
                private myType: MyFirstType
            }
            export class MySecondClass {
                private myType: MySecondType
            }
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyClasses.ts",
                typescriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes).extracting("pathWithName", "usedTypes").containsExactlyInAnyOrder(
            tuple(Path(listOf("MyClasses", "MyFirstClass")), setOf(Type.simple("MyFirstType"))),
            tuple(Path(listOf("MyClasses", "MySecondClass")), setOf(Type.simple("MySecondType")))
        )
    }

    @Test
    fun `should add used type identifier with alias to usedTypes of a Node`() {
        // given
        val typescriptCode = """
            import { MyType as MyRenamedType } from './MyType'
            export class MyClass {
                private myType: MyRenamedType
            }
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val expectedTypes = listOf(
            Type.simple("MyType")
        )
        val node = report.nodes[0]
        assertThat(node.usedTypes).containsAll(expectedTypes)
    }

    @Test
    fun `should add constructor type to usedTypes of a Node`() {
        // given
        val typescriptCode = """
            export const myConst = new MyConst()
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val expectedTypes = listOf(
            Type.simple("MyConst")
        )
        val node = report.nodes[0]
        assertThat(node.usedTypes).containsAll(expectedTypes)
    }

    @Test
    fun `should add constant type to usedTypes of a Node`() {
        // given
        val typescriptCode = """
            export const myConst = Utils.someRandomConst
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val expectedTypes = listOf(
            Type.simple("Utils")
        )
        val node = report.nodes[0]
        assertThat(node.usedTypes).containsAll(expectedTypes)
    }

    @Test
    fun `should add implemented interface to usedTypes of a node`() {
        // given
        val typescriptCode = """
            export class MyInterfaceImplementation implements MyInterface {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val expectedTypes = listOf(
            Type.simple("MyInterface")
        )
        val node = report.nodes[0]
        assertThat(node.usedTypes).containsAll(expectedTypes)
    }

    @Test
    fun `should add extended type to usedTypes of a node`() {
        // given
        val typescriptCode = """
            export class MyExtendedClass extends MyClass {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val expectedTypes = listOf(
            Type.simple("MyClass")
        )
        val node = report.nodes[0]
        assertThat(node.usedTypes).containsAll(expectedTypes)
    }

    @Test
    fun `should add imported identifiers to used types of a node`() {
        // given
        val typescriptCode = """
        import { SCT } from 'bla'
        export class Creature {
            id: CreatureId;
            type: CreatureType;
        
            constructor(id: CreatureId, type: CreatureType = SCT) {
                this.id = id;
                this.type = SCT;
            }
        }        
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val expectedTypes = listOf(Type.simple("SCT"))
        val node = report.nodes[0]
        assertThat(node.usedTypes).containsAll(expectedTypes)
        assertThat(node.usedTypes).doesNotContain(Type.simple("id"))
    }

    @Test
    fun `should add default export of a file as separate node`() {
        // given
        val typescriptCode = """
            export default MyDefaultExport;      
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val node = report.nodes[0]
        assertThat(node.dependencies).containsExactly(
            Dependency(
                Path(listOf("MyDirectory", "MyClass")),
                isWildcard = true
            )
        )
        assertThat(node.pathWithName).isEqualTo(Path(listOf("MyDirectory", "MyClass", "MyDirectory_MyClass_DEFAULT_EXPORT")))
        assertThat(node.usedTypes).containsExactly(Type.simple("MyDefaultExport"))
    }

    @Test
    fun `should add non-exported class as a node`() {
        // given
        val typescriptCode = """
            class MyPrivateClass {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val node = report.nodes[0]
        assertThat(node.pathWithName).isEqualTo(Path(listOf("MyDirectory", "MyClass", "MyPrivateClass")))
    }

    @Test
    fun `should not add the node itself to used types`() {
        // given
        val typescriptCode = """
            class MyPrivateClass {}      
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val node = report.nodes[0]
        assertThat(node.usedTypes).isEmpty()
    }

    @Test
    fun `should not add a node for declarations inside other declarations`() {
        // given
        val typescriptCode = """
            class MyOuterClass {
                myFunction() {
                    const nestedDeclaration = "Nested"
                }
            }
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes).hasSize(1)
        assertThat(report.nodes[0].pathWithName).isEqualTo(Path(listOf("MyDirectory", "MyClass", "MyOuterClass")))
    }

    @Test
    fun `should add default imports and named imports from same file to node dependencies`() {
        // given
        val typescriptCode = """
            import MyGreatInterface, { SomeNamedImport } from 'MyGreatInterface';
            
            export class MyGreatClass implements MyGreatInterface<SomeNamedImport> {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        // The default binding resolves under its local name; the named import keeps its own name.
        assertThat(report.nodes[0].dependencies).contains(
            Dependency(Path(listOf("MyGreatInterface", "MyGreatInterface"))),
            Dependency(Path(listOf("MyGreatInterface", "SomeNamedImport")))
        )
        assertThat(report.nodes[0].dependencies).noneMatch { it.path.parts.last() == "DEFAULT_EXPORT" }
    }

    @Test
    fun `should add commonjs imports to node dependencies`() {
        // given
        val typescriptCode = """
            const myModule = require('myModule');
            export class MyGreatClass {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        // A default `require` binding resolves under its local name, not the DEFAULT_EXPORT marker.
        assertThat(report.nodes[0].dependencies).contains(
            Dependency(Path(listOf("myModule", "myModule")))
        )
    }

    @Test
    fun `should add named commonjs imports to node dependencies`() {
        // given
        val typescriptCode = """
            const { myMethod } = require('myModule');
            export class MyGreatClass {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes[0].dependencies).contains(Dependency(Path(listOf("myModule", "myMethod"))))
    }

    @Test
    fun `should add alias for named commonjs imports to node dependencies`() {
        // given
        val typescriptCode = """
            const { myMethod: alias } = require('myModule');
            export class MyGreatClass {
                doSomething() { return alias() }
            }
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes[0].dependencies).contains(Dependency(Path(listOf("myModule", "myMethod"))))
        assertThat(report.nodes[0].usedTypes).contains(Type.simple("myMethod"))
    }

    @Test
    fun `should not crash on declare module statement`() {
        // given
        val typescriptCode = """
            declare module "*.md" {}   
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes).isEmpty()
    }

    @Test
    fun `should create node for exported function in declare module`() {
        // given
        val typescriptCode = """
            declare module "MyModule" {
                export function myFunction(): void;
            }
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/declarations.ts",
                typescriptCode
            )
        ).analyze()

        // then
        // Ambient module declarations use only the module name (no file path prefix)
        // so that imports like `from "MyModule"` can resolve correctly
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.FUNCTION, Path(listOf("MyModule", "myFunction")))
            )
    }

    @Test
    fun `should create node for exported class in declare module`() {
        // given
        val typescriptCode = """
            declare module "MyModule" {
                export class MyClass {}
            }
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "declarations.ts",
                typescriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.CLASS, Path(listOf("MyModule", "MyClass")))
            )
    }

    @Test
    fun `should create nodes for multiple exports in declare module`() {
        // given
        val typescriptCode = """
            declare module "MyModule" {
                export function myFunction(): void;
                export class MyClass {}
                export const myVariable: string;
            }
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "declarations.ts",
                typescriptCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactlyInAnyOrder(
                tuple(NodeType.FUNCTION, Path(listOf("MyModule", "myFunction"))),
                tuple(NodeType.CLASS, Path(listOf("MyModule", "MyClass"))),
                tuple(NodeType.VARIABLE, Path(listOf("MyModule", "myVariable")))
            )
    }

    @Test
    fun `should add identifiers used in an annotation on an exported node to usedTypes of that node`() {
        // given
        val typescriptCode = """
            import { MyComponentImport } from './MyComponentImport';
            
            @Component({
              imports: [MyComponentImport],
            })
            export class MyClass {}
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyClass.ts",
                typescriptCode
            )
        ).analyze()

        // then
        val expectedTypes = listOf(
            Type.simple("MyComponentImport")
        )
        val node = report.nodes[0]
        assertThat(node.usedTypes).containsAll(expectedTypes)
    }

    @Test
    fun `should analyze TSX file with React component`() {
        // given
        val tsxCode = """
            import React from 'react';

            export const MyComponent: React.FC = () => {
                return <div>Hello World</div>;
            }
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyComponent.tsx",
                tsxCode
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.VARIABLE, Path(listOf("MyComponent", "MyComponent")))
            )
    }

    @Test
    fun `should handle TSX file path correctly`() {
        // given
        val tsxCode = """
            export class MyReactClass {}
        """.trimIndent()
        val physicalPath = File("MyExample/Path/MyComponent.tsx").path

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                physicalPath,
                tsxCode
            )
        ).analyze()

        // then
        assertThat(report.nodes).extracting("pathWithName").containsExactly(
            Path(listOf("MyExample", "Path", "MyComponent", "MyReactClass"))
        )
    }

    @Test
    fun `should handle imports in TSX files`() {
        // given
        val tsxCode = """
            import { MyInterface } from './MyInterface';

            export const MyComponent: MyInterface = () => {
                return <div>Hello</div>;
            }
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/MyComponent.tsx",
                tsxCode
            )
        ).analyze()

        // then
        val expectedDependency = Dependency(
            path = Path(listOf("MyDirectory", "MyInterface", "MyInterface"))
        )
        val node = report.nodes[0]
        assertThat(node.dependencies).contains(expectedDependency)
        assertThat(node.usedTypes).contains(Type.simple("MyInterface"))
    }

    @Test
    fun `should handle index tsx reexports`() {
        // given
        val tsxCode = """
             export { MyReactComponent } from './MyReactComponent'
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyDirectory/index.tsx",
                tsxCode
            )
        ).analyze()

        // then
        val expectedDependency = Dependency(
            path = Path(listOf("MyDirectory", "MyReactComponent", "MyReactComponent"))
        )
        val node = report.nodes[0]
        assertThat(node.pathWithName).isEqualTo(Path(listOf("MyDirectory", "index", "MyReactComponent")))
        assertThat(node.dependencies).contains(expectedDependency)
        assertThat(node.usedTypes).containsExactly(Type.simple("MyReactComponent"))
    }

    @Test
    fun `should detect JSX elements as dependencies in React components`() {
        // Given - Routes is used only in JSX, not in TS code
        val tsxCode = """
            import { loadUser, logout } from './Auth';
            import { Routes } from './routes';

            export const App = () => {
              loadUser();
              logout();
              return <Routes />;
            };
        """.trimIndent()

        // When
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "App.tsx",
                tsxCode
            )
        ).analyze()

        // Then - All three imports should be detected as dependencies
        val loadUserDep = Dependency(path = Path(listOf("Auth", "loadUser")))
        val logoutDep = Dependency(path = Path(listOf("Auth", "logout")))
        val routesDep = Dependency(path = Path(listOf("routes", "Routes")))

        val appNode = report.nodes[0]

        // loadUser and logout are detected because they are called as functions
        assertThat(appNode.dependencies).contains(loadUserDep, logoutDep)

        // Routes is detected because it is used as a JSX element
        assertThat(appNode.dependencies)
            .withFailMessage("Routes component used in JSX should be detected as a dependency")
            .contains(routesDep)

        // Routes should also appear in usedTypes
        assertThat(appNode.usedTypes)
            .withFailMessage("Routes component used in JSX should appear in usedTypes")
            .contains(Type.simple("Routes"))
    }

    @Test
    fun `should detect JSX member expressions as dependencies`() {
        // Given - JSX member expression like <Form.Input />
        val tsxCode = """
            import { Form } from './Form';

            export const MyComponent = () => {
              return <Form.Input placeholder="test" />;
            };
        """.trimIndent()

        // When
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "MyComponent.tsx",
                tsxCode
            )
        ).analyze()

        // Then - Form should be detected as a dependency
        val formDep = Dependency(path = Path(listOf("Form", "Form")))
        val componentNode = report.nodes[0]

        assertThat(componentNode.dependencies)
            .withFailMessage("Form component used in JSX member expression <Form.Input /> should be detected")
            .contains(formDep)

        assertThat(componentNode.usedTypes)
            .withFailMessage("Form should appear in usedTypes")
            .contains(Type.simple("Form"))
    }

    @Test
    fun `should detect Routes in JSX even with complex component structure`() {
        // Given - Closer to the real App.tsx with useEffect and props destructuring
        val tsxCode = """
            import React, { useEffect } from 'react';
            import { loadUser, logout } from 'src/components/Auth/Auth_thunks';
            import { Routes } from 'src/routes';

            const _App = (props: any) => {
              useEffect(() => {
                const { loadUser, logout } = props;
                if (localStorage.user) {
                  loadUser();
                }
                window.addEventListener('storage', () => {
                  if (!localStorage.user) logout();
                });
              }, [props]);
              return <Routes />;
            };

            export const App = _App;
        """.trimIndent()

        // When
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "src/App/App.tsx",
                tsxCode
            )
        ).analyze()

        // Then - Find the _App node
        val appNode = report.nodes.find { it.pathWithName.toString().contains("_App") }
        assertThat(appNode).isNotNull

        // Routes should be detected as a dependency
        val routesDep = Dependency(path = Path(listOf("src", "routes", "Routes")))
        assertThat(appNode!!.dependencies)
            .withFailMessage("Routes component used in JSX <Routes /> should be detected even with complex component")
            .contains(routesDep)

        assertThat(appNode.usedTypes)
            .contains(Type.simple("Routes"))
    }

    @Test
    fun `should extract regular exports from index tsx files`() {
        // Given - Index file with regular export (not a re-export)
        val tsxCode = """
            import React from 'react';

            export const Routes = () => {
              return <div>Routes Component</div>;
            };
        """.trimIndent()

        // When
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "src/routes/index.tsx",
                tsxCode
            )
        ).analyze()

        // Then - Regular exports from index files should create nodes
        assertThat(report.nodes)
            .withFailMessage("Index files with regular exports should create nodes for those exports")
            .isNotEmpty()

        val routesNode = report.nodes.find { it.pathWithName.getName() == "Routes" }
        assertThat(routesNode)
            .withFailMessage("Routes exported from index.tsx should create a node")
            .isNotNull()

        assertThat(routesNode!!.pathWithName)
            .isEqualTo(Path(listOf("src", "routes", "index", "Routes")))
    }

    @Test
    fun `should create REEXPORT nodes for wildcard re-exports with file resolution`() {
        // given - Test resources with real file structure
        val testRoot = File("src/test/resources/typescript-wildcard")
        assumeTrue(testRoot.exists())

        val fileContent = "export * from './constants'"

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "common/index.ts",
                fileContent,
                analysisRoot = testRoot
            )
        ).analyze()

        // then - Should create REEXPORT nodes for discovered exports
        assertThat(report.nodes)
            .isNotEmpty()
            .allMatch { it.nodeType == NodeType.REEXPORT }

        // Should have dependencies to source
        val fooNode = report.nodes.find { it.pathWithName.getName() == "FOO" }
        assertThat(fooNode).isNotNull
        assertThat(fooNode!!.dependencies)
            .anyMatch { it.path.toString().contains("constants") }

        // Verify all expected exports are present
        // Note: Path class converts underscores to dots, so "EXCLUDED_TERMS_LIST" becomes "EXCLUDED.TERMS.LIST"
        val exportNames = report.nodes.map { it.pathWithName.getName() }.toSet()
        assertThat(exportNames).contains("FOO", "BAR", "EXCLUDED.TERMS.LIST", "RESTRICTED.ROLE.TERMS")
    }

    @Test
    fun `wildcard re-export REEXPORT nodes should depend on source nodes not themselves`() {
        // given - Test resources with real file structure
        val testRoot = File("src/test/resources/typescript-wildcard")
        assumeTrue(testRoot.exists())

        val fileContent = "export * from './constants'"

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "common/index.ts",
                fileContent,
                analysisRoot = testRoot
            )
        ).analyze()

        // then - REEXPORT nodes should depend on source nodes, not themselves
        val fooReexport = report.nodes.find { it.pathWithName.getName() == "FOO" }
        assertThat(fooReexport).isNotNull
        assertThat(fooReexport!!.nodeType).isEqualTo(NodeType.REEXPORT)

        // The REEXPORT node path is: common.index.FOO
        val reexportNodePath = Path(listOf("common", "index", "FOO"))
        assertThat(fooReexport.pathWithName).isEqualTo(reexportNodePath)

        // Expected: Should depend on source (common.index.FOO -> common.constants.index.FOO)
        val expectedSourcePath = Path(listOf("common", "constants", "index", "FOO"))

        // Bug check: Verify REEXPORT node does NOT have self-referential dependencies
        val selfRefDeps = fooReexport.dependencies.filter { it.path == reexportNodePath && !it.isWildcard }
        assertThat(selfRefDeps)
            .withFailMessage(
                "BUG: REEXPORT node has self-referential dependency ($reexportNodePath -> $reexportNodePath). " +
                    "It should depend on source node $expectedSourcePath instead."
            ).isEmpty()

        // Filter out the wildcard dependency to the file itself (added at end of analyze())
        val nonWildcardDeps = fooReexport.dependencies.filter { !it.isWildcard }

        assertThat(nonWildcardDeps)
            .withFailMessage(
                "REEXPORT node should have exactly one non-wildcard dependency to source node ($expectedSourcePath), " +
                    "but found: ${nonWildcardDeps.map { it.path }}"
            ).hasSize(1)

        assertThat(nonWildcardDeps.first().path)
            .withFailMessage(
                "REEXPORT node should depend on source node ($expectedSourcePath), not on itself ($reexportNodePath)"
            ).isEqualTo(expectedSourcePath)
    }

    @Test
    fun `wildcard re-export should not create duplicate REEXPORT node for name already declared in own file`() {
        // Given - a file that exports its own FOO and also re-exports * from constants (which also exports FOO)
        val testRoot = File("src/test/resources/typescript-wildcard")
        assumeTrue(testRoot.exists())

        val fileContent = """
            export const FOO = 'own value';
            export * from './constants'
        """.trimIndent()

        // When
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "common/index.ts",
                fileContent,
                analysisRoot = testRoot
            )
        ).analyze()

        // Then - exactly one FOO node, which is the own declaration (not a REEXPORT)
        val fooNodes = report.nodes.filter { it.pathWithName.getName() == "FOO" }
        assertThat(fooNodes).hasSize(1)
        assertThat(fooNodes.first().nodeType).isNotEqualTo(NodeType.REEXPORT)

        // BAR from constants is still present as a REEXPORT
        val barNode = report.nodes.find { it.pathWithName.getName() == "BAR" }
        assertThat(barNode).isNotNull
        assertThat(barNode!!.nodeType).isEqualTo(NodeType.REEXPORT)
    }

    @Test
    fun `should resolve namespace alias constructor call to module dependency`() {
        // given - Logger is only used via new types.Logger() with no type annotation
        val typescriptCode = """
            import * as types from './types'

            export class Consumer {
                log(): void {
                    new types.Logger().log()
                }
            }
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "Consumer.ts",
                typescriptCode
            )
        ).analyze()

        // then - Logger is captured as usedType (extracted from new types.Logger() constructor call)
        // and the wildcard dep on the types module is recorded for project-wide resolution
        val node = report.nodes.first { it.pathWithName.getName() == "Consumer" }
        assertThat(node.usedTypes).contains(Type.simple("Logger"))
        assertThat(node.dependencies).contains(Dependency(path = Path(listOf("types")), isWildcard = true))
    }

    @Test
    fun `should strip the module extensions mts and mjs from node and dependency paths`() {
        // given
        val typescriptCode = """
            import { Util } from './util.mjs'

            export class App {
                util: Util = new Util()
            }
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(FileInfo(SupportedLanguage.TYPESCRIPT, "src/app.mts", typescriptCode)).analyze()

        // then
        val node = report.nodes.single()
        assertThat(node.pathWithName).isEqualTo(Path(listOf("src", "app", "App")))
        assertThat(node.dependencies).contains(Dependency(path = Path(listOf("src", "util", "Util"))))
    }

    @Test
    fun `should recognize the tsx extension whatever its case`() {
        // given
        val typescriptCode = """
            export const Button = () => <button>Click</button>
        """.trimIndent()

        // when
        val report = TypescriptAnalyzer(FileInfo(SupportedLanguage.TYPESCRIPT, "src/Button.TSX", typescriptCode)).analyze()

        // then
        assertThat(report.nodes).extracting("pathWithName").containsExactly(Path(listOf("src", "Button", "Button")))
    }

    @Test
    fun `should expand a wildcard re-export whose source is a module with the mts extension`(
        @TempDir analysisRoot: File
    ) {
        // given
        File(analysisRoot, "util.mts").writeText("export const FOO = 1")

        // when
        val report = TypescriptAnalyzer(
            FileInfo(SupportedLanguage.TYPESCRIPT, "index.ts", "export * from './util'", analysisRoot = analysisRoot)
        ).analyze()

        // then
        val reexport = report.nodes.single { it.pathWithName.getName() == "FOO" }
        assertThat(reexport.nodeType).isEqualTo(NodeType.REEXPORT)
        assertThat(reexport.dependencies.filter { !it.isWildcard }.map { it.path }).containsExactly(Path(listOf("util", "FOO")))
    }
}
