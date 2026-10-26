package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.contract

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.build
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

class CppAnalysisPipelineTests : AnalysisPipelineContractTests() {
    override val language: SupportedLanguage = SupportedLanguage.CPP
    override val rootDirectory: String = "src/test/resources/analysis/contract/examples/cpp"
    override val nodesBuilder: ExpectedNodesBuilder = SotsCppExpectedNodesBuilder()
}

/** Every use written as the path of the class the include closure of its file declares, a library use left out. */
class SotsCppExpectedNodesBuilder : ExpectedNodesBuilder {
    override fun build(): List<ExpectedNode> = listOf(
        expected("CreatureEntity", node("adapter.persistence.CreatureEntity", "CreatureEntity.h")),
        expected(
            "CreatureRepository",
            node("adapter.persistence.CreatureRepository", "CreatureRepository.h", "adapter.persistence.CreatureEntity")
        ),
        expected(
            "PersistedCreatures",
            node(
                "adapter.persistence.PersistedCreatures",
                "PersistedCreatures.h",
                "domain.model.Creature",
                "adapter.persistence.CreatureRepository",
                "domain.service.Creatures",
                "domain.model.CreatureId"
            ),
            node(
                "adapter.persistence.PersistedCreatures",
                "PersistedCreatures.cpp",
                "adapter.persistence.CreatureRepository",
                "adapter.persistence.CreatureEntity",
                "domain.model.Creature",
                "domain.model.CreatureId",
                "domain.model.NoSuchCreatureException"
            )
        ),
        expected(
            "CreatureFacade",
            node(
                "application.CreatureFacade",
                "CreatureFacade.h",
                "domain.service.CreatureService",
                "domain.model.CreatureType",
                "domain.model.Speed",
                "domain.model.ArmorClass"
            ),
            node(
                "application.CreatureFacade",
                "CreatureFacade.cpp",
                "domain.service.CreatureService",
                "domain.model.SpeedType",
                "domain.model.Speed",
                "domain.model.Creature",
                "domain.model.HitPoints",
                "domain.model.CreatureType",
                "domain.model.ArmorClass",
                "domain.model.CreatureId"
            )
        ),
        expected("CreatureUtil", node("application.CreatureUtil", "CreatureUtil.h")),
        expected(
            "ArmorClass",
            node("domain.model.ArmorClass", "ArmorClass.h"),
            node("domain.model.ArmorClass", "ArmorClass.cpp", "application.CreatureUtil")
        ),
        expected(
            "Creature",
            node(
                "domain.model.Creature",
                "Creature.h",
                "domain.model.HitPoints",
                "domain.model.SpeedType",
                "domain.model.Speed",
                "domain.model.ArmorClass",
                "domain.model.CreatureType",
                "domain.model.CreatureId"
            ),
            node(
                "domain.model.Creature",
                "Creature.cpp",
                "application.CreatureFacade",
                "domain.model.CreatureId",
                "domain.model.CreatureType",
                "domain.model.ArmorClass",
                "domain.model.SpeedType",
                "domain.model.Speed",
                "domain.model.HitPoints"
            )
        ),
        expected("CreatureId", node("domain.model.CreatureId", "CreatureId.h")),
        expected("CreatureType", node("domain.model.CreatureType", "CreatureType.h", nodeType = NodeType.ENUM)),
        expected("Fightable", node("domain.model.Fightable", "Fightable.h")),
        expected("HitPoints", node("domain.model.HitPoints", "HitPoints.h", "domain.model.HitPoints")),
        expected(
            "NoSuchCreatureException",
            node("domain.model.NoSuchCreatureException", "NoSuchCreatureException.h", "domain.model.CreatureId")
        ),
        expected("Speed", node("domain.model.Speed", "Speed.h")),
        expected("SpeedType", node("domain.model.SpeedType", "SpeedType.h", nodeType = NodeType.ENUM)),
        expected(
            "CreatureService",
            node("domain.service.CreatureService", "CreatureService.h", "domain.service.Creatures", "domain.model.Creature"),
            node("domain.service.CreatureService", "CreatureService.cpp", "domain.service.Creatures", "domain.model.Creature")
        ),
        expected("Creatures", node("domain.service.Creatures", "Creatures.h", "domain.model.Creature", "domain.model.CreatureId"))
    )

    private fun expected(fileName: String, vararg nodes: Node) = ExpectedNode(fileName, nodes.toList())

    private fun node(path: String, fileName: String, vararg uses: String, nodeType: NodeType = NodeType.CLASS): Node = Node.build(
        pathWithName = Path.fromStringWithDots("$PROJECT_PACKAGE.$path"),
        physicalPath = fileName,
        nodeType = nodeType,
        language = SupportedLanguage.CPP,
        usedTypes = uses.mapTo(HashSet()) { Type.simple("$PROJECT_PACKAGE.$it") }
    )

    companion object {
        private const val PROJECT_PACKAGE = "de.sots.cellarsandcentaurs"
    }
}
