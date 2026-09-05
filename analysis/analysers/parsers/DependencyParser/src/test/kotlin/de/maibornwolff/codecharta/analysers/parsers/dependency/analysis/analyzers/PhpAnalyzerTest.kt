package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.PhpAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.TypeOfUsage
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import java.io.File
import kotlin.test.Test

class PhpAnalyzerTest {
    /**TODO:
     *  - phpmyadmin
     *      - 1: config.php (path=phpmyadmin/config.php/config)
     *      - 2: url.php (uses phpmyadmin/config.ph/config)
     *      - 3: config
     *          - 4: serverConfigsCheck.php
     *  => expected: url has a dependency to config but not to phpmyadmin/config
     *
     *   -----
     *   | 1 |
     *   -----
     *     ^
     *     |
     *   -----     ---------
     *   | 2 |     |   3   |
     *   -----     | ----- |
     *             | | 4 | |
     *             | ----- |
     *             --------
     *
     *  => actual:
     *         -----
     *         | 1 |
     *         -----
     *
     *         -----     ---------
     *         | 2 | --->|   3   |
     *         -----     | ----- |
     *                   | | 4 | |
     *                   | ----- |
     *                   --------
     */

    @Test
    fun `should name a node after its file with a script suffix when the file declares nothing`() {
        // given
        val code = """
            <?php
            use php\fancy\namespace;
            echo "Hello World!";
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "JustScript.php",
                code
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.SCRIPT, Path(listOf("JustScript_php", "JustScript_script")))
            )
    }

    @Test
    fun `should convert physical path to correct path with names`() {
        // given
        val code = """
            <?php
            class Person {
                private string ${'$'}name;
            }
        """.trimIndent()
        val physicalPath = File("MyExample/Path/PhpAnalyzerTest.php").path

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                physicalPath,
                code
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("pathWithName")
            .containsExactly(
                Path(listOf("MyExample", "Path", "PhpAnalyzerTest_php", "Person"))
            )
    }

    @Test
    fun `should convert namespace to correct path instead of physical path if namespace is present`() {
        // given
        val code = """
            <?php
            namespace de\analyzer\php;
            class Person {
                private string ${'$'}name;
            }
        """.trimIndent()
        val physicalPath = File("MyExample/Path/PhpAnalyzerTest.php").path

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                physicalPath,
                code
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("pathWithName")
            .containsExactly(
                Path(listOf("de", "analyzer", "php", "Person"))
            )
    }

    @Test
    fun `should convert function outside of class body to node with type FUNCTION`() {
        // given
        val code = """
            <?php
            namespace php\function;
            function myGreatFunction() {}
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.FUNCTION, Path(listOf("php", "function", "myGreatFunction")))
            )
    }

    @Test
    fun `should convert interface to node with type INTERFACE`() {
        // given
        val code = """
            <?php
            namespace php\interface;
            interface Creature {
                private string ${'$'}name;
            }
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.INTERFACE, Path(listOf("php", "interface", "Creature")))
            )
    }

    @Test
    fun `should convert enum to node with type ENUM`() {
        // given
        val code = """
            <?php
            namespace php\enum;
            enum Color: string {
                case RED = "red";
                case GREEN = "green";
                case BLUE = "blue";
            }
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.ENUM, Path(listOf("php", "enum", "Color")))
            )
    }

    @Test
    fun `should convert constant declared by define function to node with type VARIABLE`() {
        // given
        val code = """
            <?php
            namespace php\variable;
            define('MY_CONSTANT', 42);
            define("MY_SECOND_CONSTANT", "hi");
            define("MY_3_CONSTANT", 4);
            shouldNotBeIncluded("argument1", "argument2");
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactlyInAnyOrder(
                tuple(NodeType.VARIABLE, Path(listOf("php", "variable", "MY_CONSTANT"))),
                tuple(NodeType.VARIABLE, Path(listOf("php", "variable", "MY_SECOND_CONSTANT"))),
                tuple(NodeType.VARIABLE, Path(listOf("php", "variable", "MY_3_CONSTANT")))
            )
    }

    @Test
    fun `should convert constant to node with type VARIABLE only when declaration is outside of class body`() {
        // given
        val code = """
            <?php
            namespace php\variable;
            const MY_CONSTANT = 42;
            const MY_THIRD_CONSTANT = "42";
            
            class ConstantWrapper {
                const MY_SECOND_CONSTANT = 42;
            }
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactlyInAnyOrder(
                tuple(NodeType.VARIABLE, Path(listOf("php", "variable", "MY_CONSTANT"))),
                tuple(NodeType.VARIABLE, Path(listOf("php", "variable", "MY_THIRD_CONSTANT"))),
                tuple(NodeType.CLASS, Path(listOf("php", "variable", "ConstantWrapper")))
            )
    }

    @Test
    fun `import and usage of constant declared on namespace level should create dependency on constant and add constant to used types`() {
        // given
        val code = """
            <?php
            namespace php\import;
            use const php\variable\MY_CONSTANT;
            
            class Person {
                private int ${'$'}myConstant = MY_CONSTANT;
            }
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedDependencies = listOf(
            Dependency(
                path = Path(listOf("php", "variable", "MY_CONSTANT"))
            )
        )

        val expectedTypes = listOf(
            Type.simple("MY_CONSTANT", TypeOfUsage.CONSTANT_ACCESS)
        )

        val node = report.nodes.first()
        assertThat(node.dependencies).containsAll(expectedDependencies)
        assertThat(node.usedTypes).containsAll(expectedTypes)
    }

    @Test
    fun `usage of constant declared in another class should create type in node`() {
        // given
        val code = """
<?php

namespace de\sots\domain\model;
use de\sots\application\ArmorUtil;

class ArmorClass
{
    private string ${'$'}armorDescription;

    public function __construct(?string ${'$'}armorDescription = null)
    {
        ${'$'}this->armorDescription = ${'$'}description ?? ArmorUtilClass::STANDARD_ARMOR_CLASS_DESCRIPTION;
    }
    
}
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedTypes = listOf(
            Type.simple("ArmorUtilClass", TypeOfUsage.CONSTANT_ACCESS)
        )

        val node = report.nodes.first()
        assertThat(node.usedTypes).containsAll(expectedTypes)
    }

    @Test
    fun `should add own namespace to dependencies with wildcard`() {
        // given
        val code = """
            <?php
            namespace php\import;
            use php\vertebrates\Cat;
            
            class Person extends Cat{
            }
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedDependencies = listOf(
            Dependency(
                path = Path(listOf("php", "import")),
                isWildcard = true
            ),
            Dependency(
                path = Path(listOf("php", "vertebrates", "Cat"))
            )
        )

        val node = report.nodes.first()
        assertThat(node.dependencies).containsExactlyInAnyOrderElementsOf(expectedDependencies)
    }

    @Test
    fun `should add namespace usages to dependencies of a node`() {
        // given
        val code = """
            <?php
            namespace php\import;
            use php\vertebrates\Cat;
            use php\vertebrates\{Dog, Human};
            
            class Person extends Human{
            }
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedDependencies = listOf(
            Dependency(
                path = Path(listOf("php", "vertebrates", "Cat"))
            ),
            Dependency(
                path = Path(listOf("php", "vertebrates", "Dog"))
            ),
            Dependency(
                path = Path(listOf("php", "vertebrates", "Human"))
            )
        )

        val node = report.nodes.first()
        assertThat(node.dependencies).containsAll(expectedDependencies)
    }

    @Test
    fun `should add original type of aliased namespace usage to dependencies of a node`() {
        // given
        val code = """
            <?php
            namespace php\import;
            use php\invertebrates\Bee as Pet;
            
            class HoneyBee extends Pet{
            }
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedDependencies = listOf(
            Dependency(
                path = Path(listOf("php", "invertebrates", "Bee"))
            )
        )

        val node = report.nodes.first()
        assertThat(node.dependencies).containsAll(expectedDependencies)
    }

    @Test
    fun `should add original type of aliased namespace usage to usedTypes of a node`() {
        // given
        val code = """
            <?php
            namespace php\import;
            use php\invertebrates\Bee as Pet;
            use php\invertebrates\Dog as GoodBoy;
            
            class HoneyBee extends Pet{
            }
            
            class Pete extends GoodBoy{
            }
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedUsedTypes = listOf(
            Type.simple("Bee", TypeOfUsage.INHERITANCE),
            Type.simple("Dog", TypeOfUsage.INHERITANCE)
        )

        val node = report.nodes.flatMap { it.usedTypes }
        assertThat(node).containsAll(expectedUsedTypes)
    }

    @Test
    fun `should add require statements with relative path of node to dependencies of a node`() {
        // given
        val code = """
             <?php
            require_once '../../../model/Creature.php';
            require '../../domain/model/OtherCreature.php';
            
            class HoneyBee extends Creature{
            }

        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "src/de/sots/adapter/persistence/TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedDependencies = listOf(
            Dependency(Path(listOf("src", "de", "model", "Creature"))),
            Dependency(Path(listOf("src", "de", "sots", "domain", "model", "OtherCreature")))
        )

        val node = report.nodes.first()
        assertThat(node.dependencies).containsAll(expectedDependencies)
    }

    @Test
    fun `should add require statements with relative path of namespace if present to dependencies of a node`() {
        // given
        val code = """
             <?php
            namespace de\sots\adapter\persistence;
            require_once '../../../model/Creature.php';
            require '../../domain/model/OtherCreature.php';
            
            class HoneyBee extends Creature{
            }

        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "src/de/sots/adapter/persistence/TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedDependencies = listOf(
            Dependency(Path(listOf("de", "model", "Creature"))),
            Dependency(Path(listOf("de", "sots", "domain", "model", "OtherCreature")))
        )

        val node = report.nodes.first()
        assertThat(node.dependencies).containsAll(expectedDependencies)
    }

    @Test
    fun `should add include statements with relative path to dependencies of a node`() {
        // given
        val code = """
             <?php
            include_once '../../../domain/model/Creature.php';
            include '../../domain/model/OtherCreature.php';
            
            class HoneyBee extends Creature{
            }

        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "php/test/analyzer/domain/TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedDependencies = listOf(
            Dependency(Path(listOf("php", "domain", "model", "Creature"))),
            Dependency(Path(listOf("php", "test", "domain", "model", "OtherCreature")))
        )

        val node = report.nodes.first()
        assertThat(node.dependencies).containsAll(expectedDependencies)
    }

    @Test
    fun `should add used type of class property to usedTypes of a Node`() {
        // given
        val code = """
            <?php
            namespace php\test\analyzer;
            use php\invertebrates\Bee;
            use php\vertebrates\{Dog, Cat};
            
            class Person {
                private Cat ${'$'}pet;
                private ?Bee ${'$'}honeyBee;
            }
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedUsedTypes = setOf(
            Type.simple("Cat"),
            Type.simple("Bee")
        )

        val node = report.nodes.first()
        assertThat(node.usedTypes).containsExactlyInAnyOrderElementsOf(expectedUsedTypes)
    }

    @Test fun `should add inherited type to used types of a Node`() {
        // given
        val code = """
            <?php
            namespace php\test\analyzer;
            use php\invertebrates\Bee;
            use php\vertebrates\{Dog, Cat};
            
            class Person extends Human{
            }
        """.trimIndent()
        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedInheritedTypes = setOf(
            Type.simple("Human", TypeOfUsage.INHERITANCE)
        )

        val node = report.nodes.first()
        assertThat(node.usedTypes).containsExactlyInAnyOrderElementsOf(expectedInheritedTypes)
    }

    @Test fun `should add implemented type to used types of a Node`() {
        // given
        val code = """
            <?php
            namespace php\test\analyzer;
            use php\invertebrates\Bee;
            use php\vertebrates\{Dog, Cat};
            
            class Person implements Human, Animal{
            }
        """.trimIndent()
        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedInheritedTypes = setOf(
            Type.simple("Human", TypeOfUsage.IMPLEMENTATION),
            Type.simple("Animal", TypeOfUsage.IMPLEMENTATION)
        )

        val node = report.nodes.first()
        assertThat(node.usedTypes).containsExactlyInAnyOrderElementsOf(expectedInheritedTypes)
    }

    @Test fun `should add inherited and implemented types to used types of a Node`() {
        // given
        val code = """
            <?php
            namespace php\test\analyzer;
            use php\invertebrates\Bee;
            use php\vertebrates\{Dog, Cat};
            
            class Person extends Animal implements Human, {
            }
        """.trimIndent()
        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedInheritedTypes = setOf(
            Type.simple("Human", TypeOfUsage.IMPLEMENTATION),
            Type.simple("Animal", TypeOfUsage.INHERITANCE)
        )

        val node = report.nodes.first()
        assertThat(node.usedTypes).containsExactlyInAnyOrderElementsOf(expectedInheritedTypes)
    }

    @Test
    fun `should add types of new statements to types of a Node`() {
        // given
        val code = """
            <?php
            namespace php\test\analyzer;
            use php\invertebrates\Bee;
            use php\vertebrates\{Dog, Cat};
            
            function myGreatFunction() {
                ${'$'}pet = new Dog();
            }
            
            class Person {
                private ${'$'}pet;
                private ${'$'}specialPet = new Bee();
                
                public function __construct() {
                    ${'$'}this->pet = new Cat();
                }
            }
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedInheritedTypes = setOf(
            Type.simple("Cat", TypeOfUsage.INSTANTIATION),
            Type.simple("Dog", TypeOfUsage.INSTANTIATION),
            Type.simple("Bee", TypeOfUsage.INSTANTIATION)
        )

        val usedTypes = report.nodes.flatMap { it.usedTypes }
        assertThat(usedTypes).containsExactlyInAnyOrderElementsOf(expectedInheritedTypes)
    }

    @Test
    fun `should add types of function arguments to types of a Node`() {
        // given
        val code = """
            <?php
            namespace php\test\analyzer;
            use php\invertebrates\Bee;
            use php\vertebrates\{Dog, Cat};
            
             function myGreatFunction(Dog ${'$'}dog) {
             }
                
            class Person {
                public function __construct(Cat ${'$'}cat) {
                }
                
                function myInsideFunction(Bee ${'$'}bee) {
                }
            }
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedInheritedTypes = setOf(
            Type.simple("Cat", TypeOfUsage.ARGUMENT),
            Type.simple("Dog", TypeOfUsage.ARGUMENT),
            Type.simple("Bee", TypeOfUsage.ARGUMENT)
        )

        val usedTypes = report.nodes.flatMap { it.usedTypes }
        assertThat(usedTypes).containsExactlyInAnyOrderElementsOf(expectedInheritedTypes)
    }

    @Test
    fun `should add return types of function to types of a Node`() {
        // given
        val code = """
            <?php
            namespace php\test\analyzer;
            use php\invertebrates\Bee;
            use php\vertebrates\{Dog, Cat};
            
             function myGreatFunction(): Dog {
                 return new DogFactory().create();
             }
                
            class Person {
                public function __construct(): ?Cat {
                    return new CatFactory().create();
                }
                
                function myInsideFunction(): Bee {
                    return new BeeFactory().create();
                }
            }
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedInheritedTypes = setOf(
            Type.simple("Cat", TypeOfUsage.RETURN_VALUE),
            Type.simple("Dog", TypeOfUsage.RETURN_VALUE),
            Type.simple("Bee", TypeOfUsage.RETURN_VALUE)
        )

        val usedTypes = report.nodes.flatMap { it.usedTypes }
        assertThat(usedTypes).containsAll(expectedInheritedTypes)
    }

    @Test
    fun `should add static function access to used types of a Node`() {
        // given
        val code = """
            <?php
            namespace php\test\analyzer;
            use php\invertebrates\Bee;
            use php\vertebrates\{Dog, Cat};
            
             function myGreatFunction(): Dog {
                 return new DogFactory().create();
             }
                
            class Person {
                public function __construct(): ?Cat {
                    return new CatFactory().create();
                }
                
                function myInsideFunction(): Bee {
                    return new BeeFactory().create();
                }
                
                function myStaticFunction() {
                    return Animal::getAnimal();
                }
            }
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedInheritedTypes = setOf(
            Type.simple("Animal")
        )

        val usedTypes = report.nodes.flatMap { it.usedTypes }
        assertThat(usedTypes).containsAll(expectedInheritedTypes)
    }

    @Test
    fun `should convert traits to node with type CLASS`() {
        // given
        val code = """
            <?php
            namespace php\traits;
            trait MyTrait {
                private string ${'$'}name;
            }
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        assertThat(report.nodes)
            .extracting("nodeType", "pathWithName")
            .containsExactly(
                tuple(NodeType.CLASS, Path(listOf("php", "traits", "MyTrait")))
            )
    }

    @Test
    fun `should add trait to used types of a Node if its used inside of a class`() {
        // given
        val code = """
            <?php
            namespace php\traits;
            use php\traits\MyTrait;
            
            class Person {
                use MyTrait;
            }
        """.trimIndent()

        // when
        val report = PhpAnalyzer(
            FileInfo(
                SupportedLanguage.PHP,
                "TestClass.php",
                code
            )
        ).analyze()

        // then
        val expectedUsedTypes = setOf(
            Type.simple("MyTrait")
        )

        val node = report.nodes.first()
        assertThat(node.usedTypes).containsAll(expectedUsedTypes)
    }

    @Test
    fun `should import every grouped use declaration`() {
        // Arrange
        val code = """
            <?php
            namespace php\import;
            use php\vertebrates\{Dog, Cat};
            use php\invertebrates\{Bee, Ant};

            class Zoo {
            }
        """.trimIndent()

        // Act
        val report = PhpAnalyzer(FileInfo(SupportedLanguage.PHP, "Zoo.php", code)).analyze()

        // Assert
        assertThat(report.nodes.first().dependencies).contains(
            Dependency(Path(listOf("php", "vertebrates", "Dog"))),
            Dependency(Path(listOf("php", "vertebrates", "Cat"))),
            Dependency(Path(listOf("php", "invertebrates", "Bee"))),
            Dependency(Path(listOf("php", "invertebrates", "Ant")))
        )
    }
}
