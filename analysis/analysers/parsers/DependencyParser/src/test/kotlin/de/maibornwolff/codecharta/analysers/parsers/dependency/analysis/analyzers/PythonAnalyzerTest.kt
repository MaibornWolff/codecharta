package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python.PythonAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.io.File

class PythonAnalyzerTest {
    @Test
    fun `should convert variable definition to correct type and correct path with names`() {
        // Arrange
        val pythonCode = """            
TEST = "test"
        """
        val physicalPath = File("MyExample/Path/PythonAnalyzerTest.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        assertThat(report.nodes).extracting("nodeType", "pathWithName").containsExactly(
            tuple(NodeType.VARIABLE, Path(listOf("MyExample", "Path", "PythonAnalyzerTest", "TEST")))
        )
    }

    @Test
    fun `should convert function definition to correct type and correct path with names`() {
        // Arrange
        val pythonCode = """            
def doSomething():
    pass
        """
        val physicalPath = File("MyExample/Path/PythonAnalyzerTest.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        assertThat(report.nodes).extracting("nodeType", "pathWithName").containsExactly(
            tuple(NodeType.FUNCTION, Path(listOf("MyExample", "Path", "PythonAnalyzerTest", "doSomething")))
        )
    }

    @Test
    fun `should convert class definition to correct type and correct path with names`() {
        // Arrange
        val pythonCode = """            
class TestClass():
    pass
        """
        val physicalPath = File("MyExample/Path/PythonAnalyzerTest.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        assertThat(report.nodes).extracting("nodeType", "pathWithName").containsExactly(
            tuple(NodeType.CLASS, Path(listOf("MyExample", "Path", "PythonAnalyzerTest", "TestClass")))
        )
    }

    @Test
    fun `should convert a decorated class definition to correct type and correct path with names`() {
        // Arrange
        val pythonCode = """            
@testDecorator
class TestClass():
    pass
        """
        val physicalPath = File("MyExample/Path/PythonAnalyzerTest.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        assertThat(report.nodes).extracting("nodeType", "pathWithName").containsExactly(
            tuple(NodeType.CLASS, Path(listOf("MyExample", "Path", "PythonAnalyzerTest", "TestClass")))
        )
    }

    @Test
    fun `should convert imports in __init__ to nodes`() {
        // Arrange
        val pythonCode = """            
from .creature import Creature
from de.sots.cellarsandcentaurs.domain.models.speed import Speed
        """
        val physicalPath = File("de/sots/cellarsandcentaurs/domain/models/__init__.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(2, nodes.size)
        assertThat(report.nodes).extracting("nodeType", "pathWithName").containsExactlyInAnyOrder(
            tuple(
                NodeType.UNKNOWN,
                Path(listOf("de", "sots", "cellarsandcentaurs", "domain", "models", "__init__", "Creature"))
            ),
            tuple(
                NodeType.UNKNOWN,
                Path(listOf("de", "sots", "cellarsandcentaurs", "domain", "models", "__init__", "Speed"))
            )
        )
    }

    @Test
    fun `should make a name an __init__ imports under an alias a re-export named by the alias, using what it imports`() {
        // Arrange
        val pythonCode = """
from .mod import Foo as Bar
        """
        val physicalPath = File("pkg/__init__.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        val reexport = report.nodes.single()
        assertThat(reexport.pathWithName).isEqualTo(Path(listOf("pkg", "__init__", "Bar")))
        assertThat(reexport.usedTypes).containsExactly(
            Type.simple("pkg.mod.Foo").copy(fallbacks = listOf(Type.simple("pkg.mod.__init__.Foo")))
        )
    }

    @Test
    fun `should parse from imports and add them to the node's dependencies and add used types`() {
        // Arrange
        val pythonCode = """
from de.sots.cellarsandcentaurs.domain.models import Creature, Speed

class TestClass():
    def __init__(creature: Creature):
        self.creature = creature
        """
        val physicalPath = File("MyExample/Path/PythonAnalyzerTest.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertEquals(4, dependencies.size)
        assertThat(dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.domain.models.Creature")),
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.domain.models.__init__.Creature")),
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.domain.models.Speed")),
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.domain.models.__init__.Speed"))
        )

        val usedTypes = report.nodes.first().usedTypes
        assertEquals(2, usedTypes.size)
        assertThat(usedTypes).containsExactlyInAnyOrder(
            Type.simple("Creature"),
            Type.simple("self")
        )
    }

    @Test
    fun `should parse from wildcard imports and add them to the node's dependencies`() {
        // Arrange
        val pythonCode = """
from de.sots.cellarsandcentaurs.domain.models import *

class TestClass():
    def __init__(creature: Creature):
        self.creature = creature
        """
        val physicalPath = File("MyExample/Path/PythonAnalyzerTest.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertEquals(2, dependencies.size)
        assertThat(dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.domain.models"), true),
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.domain.models.__init__"), true)
        )
    }

    @Test
    fun `should parse relative from imports and add them to the node's dependencies`() {
        // Arrange
        val pythonCode = """
from .creature_service import Creature_Service
from ..models import *
from ...application.creature_facade import CreatureFacade

class TestClass():
    pass
        """
        val physicalPath = File("de/sots/cellarsandcentaurs/domain/services/creatures.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertEquals(6, dependencies.size)
        assertThat(dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.domain.services.creature_service.Creature_Service")),
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.domain.services.creature_service.__init__.Creature_Service")),
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.application.creature_facade.CreatureFacade")),
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.application.creature_facade.__init__.CreatureFacade")),
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.domain.models"), true),
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.domain.models.__init__"), true)
        )
    }

    @Test
    fun `should parse aliased from imports and add them to the node's dependencies`() {
        // Arrange
        val pythonCode = """
from de.sots.cellarsandcentaurs.domain.services.creature_service import Creature_Service as cs

class TestClass():
    def __init__(self, creature_service: cs):
        pass
        """
        val physicalPath = File("MyExample/Path/PythonAnalyzerTest.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertEquals(2, dependencies.size)
        assertThat(dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.domain.services.creature_service.Creature_Service")),
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.domain.services.creature_service.__init__.Creature_Service"))
        )

        val usedTypes = report.nodes.first().usedTypes
        assertEquals(1, usedTypes.size)
        assertThat(usedTypes).containsExactly(Type.simple("Creature_Service"))
    }

    @Test
    fun `should not add dependencies for unused imports`() {
        // Arrange
        val pythonCode = """
from de.sots.cellarsandcentaurs.domain.models.creature import Creature as crt

class TestClass():
    def __init__(self):
        pass
        """
        val physicalPath = File("MyExample/Path/PythonAnalyzerTest.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertEquals(0, dependencies.size)
        assertThat(report.nodes.first().usedTypes).isEmpty()
    }

    @Test
    fun `should parse imports and add them to the node's dependencies`() {
        // Arrange
        val pythonCode = """
import de.sots.cellarsandcentaurs.domain.models

def doSomething():
    de.sots.cellarsandcentaurs.domain.models.Creature.doSomething()
        """
        val physicalPath = File("MyExample/Path/PythonAnalyzerTest.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertEquals(2, dependencies.size)
        assertThat(dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.domain.models.Creature")),
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.domain.models.__init__.Creature"))
        )

        val usedTypes = report.nodes.first().usedTypes
        assertEquals(2, usedTypes.size)
        assertThat(usedTypes).containsExactlyInAnyOrder(
            Type.simple("de"),
            Type.simple("de.sots.cellarsandcentaurs.domain.models.Creature").copy(
                fallbacks = listOf(Type.simple("de.sots.cellarsandcentaurs.domain.models.__init__.Creature"))
            )
        )
    }

    @Test
    fun `should parse aliased imports and add them to the node's dependencies`() {
        // Arrange
        val pythonCode = """
import de.sots.cellarsandcentaurs.domain.models as md

def doSomething():
    md.Creature.doSomething()
        """
        val physicalPath = File("MyExample/Path/PythonAnalyzerTest.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertEquals(2, dependencies.size)
        assertThat(dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.domain.models.Creature")),
            Dependency(Path.fromStringWithDots("de.sots.cellarsandcentaurs.domain.models.__init__.Creature"))
        )

        val usedTypes = report.nodes.first().usedTypes
        assertEquals(2, usedTypes.size)
        assertThat(usedTypes).containsExactlyInAnyOrder(
            Type.simple("md"),
            Type.simple("de.sots.cellarsandcentaurs.domain.models.Creature").copy(
                fallbacks = listOf(Type.simple("de.sots.cellarsandcentaurs.domain.models.__init__.Creature"))
            )
        )
    }

    @Test
    fun `should report a name written behind an imported module as that module's name, its package's name as fallback`() {
        // Arrange
        val pythonCode = """
import app.models as am

def make():
    return am.Model()
        """
        val physicalPath = File("app/factory.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        assertThat(report.nodes.first().usedTypes).contains(
            Type.simple("app.models.Model").copy(fallbacks = listOf(Type.simple("app.models.__init__.Model")))
        )
    }

    @Test
    fun `should report a name written behind an imported submodule as that submodule's name`() {
        // Arrange
        val pythonCode = """
from ..model import speed as tempo

def make():
    return tempo.Speed(30)
        """
        val physicalPath = File("app/service/factory.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        assertThat(report.nodes.first().usedTypes).contains(
            Type.simple("app.model.speed.Speed").copy(fallbacks = listOf(Type.simple("app.model.speed.__init__.Speed")))
        )
    }

    @Test
    fun `should give a class nested in a class the path of the outer class plus its name`() {
        // Arrange
        val pythonCode = """
class Order:
    class Line:
        pass
        """
        val physicalPath = File("shop/order.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        assertThat(report.nodes.map { it.pathWithName }).containsExactly(
            Path(listOf("shop", "order", "Order")),
            Path(listOf("shop", "order", "Order", "Line"))
        )
    }
}
