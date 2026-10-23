package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python.PythonAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
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
    fun `should make a use of an imported name that module's name, its package's name as fallback`() {
        // Arrange
        val pythonCode = """
from shop.models import Creature

class Keeper:
    def __init__(self, creature: Creature):
        self.creature = creature
        """
        val physicalPath = File("shop/keeper.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        assertThat(report.nodes.single().usedTypes).containsExactly(
            Type.simple("shop.models.Creature").copy(fallbacks = listOf(Type.simple("shop.models.__init__.Creature")))
        )
    }

    @Test
    fun `should make a use of a declaration of the own module its path below the file`() {
        // Arrange
        val pythonCode = """
class Base:
    pass

class Cart(Base):
    pass
        """
        val physicalPath = File("shop/cart.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        assertThat(report.nodes.last().usedTypes).containsExactly(Type.simple("shop.cart.Base"))
    }

    @Test
    fun `should resolve a relative import against the package of the file`() {
        // Arrange
        val pythonCode = """
from .creature_service import CreatureService
from ...application.creature_facade import CreatureFacade

class Creatures(CreatureService, CreatureFacade):
    pass
        """
        val physicalPath = File("shop/domain/services/creatures.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        assertThat(report.nodes.single().usedTypes.map { it.name }).containsExactly(
            "shop.domain.services.creature_service.CreatureService",
            "shop.application.creature_facade.CreatureFacade"
        )
    }

    @Test
    fun `should make a use behind a module alias the names its chain can mean, the deepest declaration first`() {
        // Arrange
        val pythonCode = """
import shop.models as md

def create():
    md.Creature.spawn()
        """
        val physicalPath = File("shop/factory.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        val use = report.nodes.single().usedTypes.single()
        assertThat(listOf(use.name) + use.fallbacks.map { it.name }).containsExactly(
            "shop.models.Creature.spawn",
            "shop.models.Creature",
            "shop.models.__init__.Creature.spawn",
            "shop.models.__init__.Creature",
            "shop.models.Creature.__init__.spawn"
        )
    }

    @Test
    fun `should make a use with fallbacks the names of the use, then those of its fallbacks`() {
        // Arrange
        val pythonCode = """
from shop.first import *
from shop.second import *

def grow():
    return Node()
        """
        val physicalPath = File("shop/tree.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        val use = report.nodes.single().usedTypes.single()
        assertThat(listOf(use.name) + use.fallbacks.map { it.name }).containsExactly(
            "shop.second.Node",
            "shop.second.__init__.Node",
            "shop.first.Node",
            "shop.first.__init__.Node"
        )
    }

    @Test
    fun `should make no use of an import alone`() {
        // Arrange
        val pythonCode = """
from shop.models.creature import Creature as crt

class Keeper():
    def __init__(self):
        pass
        """
        val physicalPath = File("shop/keeper.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode)).analyze()

        // Assert
        assertThat(report.nodes.single().usedTypes).isEmpty()
    }

    @Test
    fun `should look a module up below its import root`(
        @TempDir root: File
    ) {
        // Arrange
        listOf("svc/src/app/__init__.py", "svc/src/app/models.py").forEach {
            root
                .resolve(it)
                .also { file ->
                    file.parentFile.mkdirs()
                }.writeText("")
        }
        val pythonCode = """
from app.models import Model

class View(Model):
    pass
        """
        val physicalPath = File("svc/src/app/views.py").path

        // Act
        val report = PythonAnalyzer(FileInfo(SupportedLanguage.PYTHON, physicalPath, pythonCode, root)).analyze()

        // Assert
        assertThat(report.nodes.single().usedTypes).containsExactly(Type.simple("svc.src.app.models.Model"))
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
