package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.contract

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.TypeOfUsage
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

class CppAnalysisPipelineTests : AnalysisPipelineContractTests() {
    override val language: SupportedLanguage = SupportedLanguage.CPP
    override val rootDirectory: String = "src/test/resources/analysis/contract/examples/cpp"
    override val nodesBuilder: ExpectedNodesBuilder = SotsCppExpectedNodesBuilder()
}

class SotsCppExpectedNodesBuilder : SotsExpectedNodesBuilder() {
    private val domainModel = "src/de/sots/cellarsandcentaurs/domain/model/"
    private val domainService = "src/de/sots/cellarsandcentaurs/domain/service/"
    private val application = "src/de/sots/cellarsandcentaurs/application/"
    private val adapterPersistence = "src/de/sots/cellarsandcentaurs/adapter/persistence/"

    override fun build(): List<ExpectedNode> {
        val expectedNodes = super.build()
        return expectedNodes.map { expectedNode ->
            expectedNode.copy(
                ignorableDependencies = setOf(
                    Dependency(Path("std"))
                ),
                ignorableTypes = setOf(
                    Type.simple("std::optional"),
                    Type.simple("std::unordered_map"),
                    Type.simple("string"),
                    Type.simple("shared_ptr"),
                    Type.simple("int"),
                    Type.simple("void"),
                    Type.simple("char"),
                    Type.simple("move"),
                    Type.simple("string"),
                    Type.simple("std"),
                    Type.simple("unparsable_type_in_analysis")
                )
            )
        }
    }

    override fun buildCreatureServiceResult(): ExpectedNode {
        val superResult = super.buildCreatureServiceResult()
        return superResult.copy(
            nodes = listOf(
                superResult.nodes.first().copy(
                    physicalPath = "${domainService}CreatureService.cpp",
                    dependencies = setOf(
                        Dependency.simple("CreatureService.h"),
                        Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "service"), isWildcard = true),
                        Dependency(Path("model"), isWildcard = true)
                    ),
                    usedTypes = setOf(
                        Type.generic(
                            "shared_ptr",
                            listOf(
                                Type.simple("Creatures")
                            ),
                            TypeOfUsage.ARGUMENT
                        ),
                        Type.simple("Creature", typeOfUsage = TypeOfUsage.ARGUMENT)
                    )
                ),
                superResult.nodes.first().copy(
                    physicalPath = "CreatureService.h",
                    dependencies = setOf(
                        Dependency.simpleFromPhysicalPath("${domainModel}Creature.h"),
                        Dependency.simple("Creatures.h"),
                        Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "service"), isWildcard = true)
                    ),
                    usedTypes = setOf(
                        Type.generic(
                            "shared_ptr",
                            listOf(
                                Type.simple("Creatures")
                            ),
                            TypeOfUsage.ARGUMENT
                        ),
                        Type.simple("Creature", typeOfUsage = TypeOfUsage.ARGUMENT)
                    )
                )
            )
        )
    }

    override fun buildCreatureResult(): ExpectedNode {
        val superResult = super.buildCreatureResult()
        val domainModel = domainModel
        return superResult.copy(
            nodes = listOf(
                superResult.nodes.first().copy(
                    physicalPath = "${domainModel}Creature.cpp",
                    dependencies = setOf(
                        Dependency.simple("Creature.h"),
                        Dependency.simpleFromPhysicalPath("${application}CreatureFacade.h"),
                        Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model"), isWildcard = true)
                    ),
                    usedTypes = setOf(
                        Type.simple("CreatureId"),
                        Type.simple("CreatureType"),
                        Type.simple("CreatureFacade", typeOfUsage = TypeOfUsage.ARGUMENT),
                        Type.simple("ArmorClass"),
                        Type.generic(
                            "unordered_map",
                            listOf(
                                Type.simple("SpeedType"),
                                Type.simple("Speed")
                            )
                        ),
                        Type.generic("optional", listOf(Type.simple("HitPoints")))
                    )
                ),
                superResult.nodes.first().copy(
                    physicalPath = "Creature.h",
                    dependencies = setOf(
                        Dependency.simple("CreatureId.h"),
                        Dependency.simple("CreatureType.h"),
                        Dependency.simple("ArmorClass.h"),
                        Dependency.simple("SpeedType.h"),
                        Dependency.simple("Speed.h"),
                        Dependency.simple("HitPoints.h"),
                        Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model"), isWildcard = true)
                    ),
                    usedTypes = setOf(
                        Type.simple("CreatureId"),
                        Type.generic(
                            "optional",
                            listOf(
                                Type.simple("CreatureType")
                            )
                        ),
                        Type.generic(
                            "optional",
                            listOf(
                                Type.simple("ArmorClass")
                            )
                        ),
                        Type.simple("ArmorClass"),
                        Type.generic(
                            "unordered_map",
                            listOf(
                                Type.simple("SpeedType"),
                                Type.simple("Speed")
                            )
                        ),
                        Type.generic(
                            "optional",
                            listOf(
                                Type.simple("HitPoints")
                            )
                        )
                    )
                )
            )
        )
    }

    override fun buildCreatureFacadeResult(): ExpectedNode {
        val superResult = super.buildCreatureFacadeResult()
        return superResult.copy(
            nodes = listOf(
                superResult.nodes.first().copy(
                    physicalPath = "${application}CreatureFacade.cpp",
                    dependencies = setOf(
                        Dependency.simple("CreatureFacade.h"),
                        Dependency.simpleFromPhysicalPath("${domainModel}Creature.h"),
                        Dependency.simpleFromPhysicalPath("${domainModel}CreatureId.h"),
                        Dependency.simpleFromPhysicalPath("${domainService}CreatureService.h"),
                        Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model"), isWildcard = true),
                        Dependency(Path("domain", "model"), isWildcard = true),
                        Dependency(Path("domain", "service"), isWildcard = true),
                        Dependency(Path("de", "sots", "cellarsandcentaurs", "application"), isWildcard = true)
                    ),
                    usedTypes = setOf(
                        Type.generic("shared_ptr", listOf(Type.simple("CreatureService")), TypeOfUsage.ARGUMENT),
                        Type.simple("CreatureType"),
                        Type.simple("Speed"),
                        Type.simple("ArmorClass"),
                        Type.simple("HitPoints"),
                        Type.simple("Creature")
                    )
                ),
                superResult.nodes.first().copy(
                    physicalPath = "${application}CreatureFacade.h",
                    dependencies = setOf(
                        Dependency(Path.fromPhysicalPath("${domainModel}Creature.h")),
                        Dependency(Path.fromPhysicalPath("${domainModel}ArmorClass.h")),
                        Dependency(Path.fromPhysicalPath("${domainModel}Speed.h")),
                        Dependency(Path.fromPhysicalPath("${domainService}CreatureService.h"))
                    ),
                    usedTypes = setOf(
                        Type.simple("CreatureType"),
                        Type.simple("ArmorClass"),
                        Type.simple("Speed"),
                        Type.generic("shared_ptr", listOf(Type.simple("CreatureService")), TypeOfUsage.ARGUMENT)
                    )
                )
            )
        )
    }

    override fun buildArmorClassResult(): ExpectedNode {
        val superResult = super.buildArmorClassResult()
        val armorClassNode = superResult.nodes.first()
        return superResult.copy(
            nodes = listOf(
                armorClassNode.copy(
                    physicalPath = "${domainModel}ArmorClass.cpp",
                    dependencies = setOf(
                        Dependency.simple("ArmorClass.h"),
                        Dependency.simpleFromPhysicalPath("${application}CreatureUtil.h"),
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "application"),
                        Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model"), isWildcard = true)
                    ),
                    usedTypes = setOf(
                        Type.simple("CreatureUtil", typeOfUsage = TypeOfUsage.INSTANTIATION)
                    )
                ),
                armorClassNode.copy(
                    physicalPath = "ArmorClass.h",
                    dependencies = setOf(
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "domain", "model")
                    ),
                    usedTypes = emptySet()
                )
            )
        )
    }

    override fun buildPersistedCreaturesResult(): ExpectedNode {
        val superResult = super.buildPersistedCreaturesResult()
        val persistedCreaturesNode = superResult.nodes.first()
        return superResult.copy(
            nodes = listOf(
                persistedCreaturesNode.copy(
                    physicalPath = "${adapterPersistence}PersistedCreatures.cpp",
                    dependencies = setOf(
                        Dependency.simple("PersistedCreatures.h"),
                        Dependency.simpleFromPhysicalPath("${domainModel}Creature.h"),
                        Dependency.simpleFromPhysicalPath("${domainModel}NoSuchCreatureException.h"),
                        Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model"), isWildcard = true)
                    ),
                    usedTypes = setOf(
                        Type.generic("shared_ptr", listOf(Type.simple("CreatureRepository")), TypeOfUsage.ARGUMENT),
                        Type.simple("Creature", typeOfUsage = TypeOfUsage.ARGUMENT),
                        Type.simple("NoSuchCreatureException"),
                        Type.simple("CreatureId", typeOfUsage = TypeOfUsage.ARGUMENT),
                        Type.simple("CreatureEntity", typeOfUsage = TypeOfUsage.ARGUMENT)
                    )
                ),
                persistedCreaturesNode.copy(
                    physicalPath = "${adapterPersistence}PersistedCreatures.h",
                    dependencies = setOf(
                        Dependency.simple("CreatureRepository.h"),
                        Dependency.simpleFromPhysicalPath("${domainModel}Creature.h"),
                        Dependency.simpleFromPhysicalPath("${domainModel}CreatureId.h"),
                        Dependency.simpleFromPhysicalPath("${domainService}Creatures.h"),
                        Dependency(Path("domain", "model"), isWildcard = true),
                        Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "service"), isWildcard = true)
                    ),
                    usedTypes = setOf(
                        Type.generic("shared_ptr", listOf(Type.simple("CreatureRepository"))),
                        Type.simple("Creatures", typeOfUsage = TypeOfUsage.INHERITANCE),
                        Type.simple("Creature"),
                        Type.simple("CreatureId"),
                        Type.simple("void")
                    )
                )
            )
        )
    }

    override fun buildCreatureRepositoryResult(): ExpectedNode {
        val superResult = super.buildCreatureRepositoryResult()
        val creatureRepositoryNode = superResult.nodes.first()
        return superResult.copy(
            nodes = listOf(
                creatureRepositoryNode.copy(
                    physicalPath = "${adapterPersistence}CreatureRepository.h",
                    nodeType = NodeType.CLASS,
                    dependencies = setOf(
                        Dependency(
                            Path("de", "sots", "cellarsandcentaurs", "adapter", "persistence"),
                            isWildcard = true
                        ),
                        Dependency(Path("CreatureEntity.h"))
                    ),
                    usedTypes = setOf(
                        Type.generic(
                            "optional",
                            listOf(Type.simple("CreatureEntity", typeOfUsage = TypeOfUsage.ARGUMENT))
                        ),
                        Type.simple("string", typeOfUsage = TypeOfUsage.ARGUMENT),
                        Type.simple("CreatureEntity")
                    )
                )
            )
        )
    }

    override fun buildCreaturesResult(): ExpectedNode {
        val superResult = super.buildCreaturesResult()
        val node = superResult.nodes.first()
        return superResult.copy(
            nodes = listOf(
                node.copy(
                    physicalPath = "Creatures.h",
                    nodeType = NodeType.CLASS,
                    dependencies = setOf(
                        Dependency.simpleFromPhysicalPath("${domainModel}Creature.h"),
                        Dependency.simpleFromPhysicalPath("${domainModel}CreatureId.h"),
                        Dependency.simpleFromPhysicalPath("${domainModel}NoSuchCreatureException.h"),
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "domain", "model"),
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "domain", "service")
                    ),
                    usedTypes = setOf(
                        Type.simple("Creature"),
                        Type.simple("CreatureId")
                    )
                )
            )
        )
    }

    override fun buildFightableResult(): ExpectedNode {
        val superResult = super.buildFightableResult()
        val node = superResult.nodes.first()
        return superResult.copy(
            nodes = listOf(
                node.copy(
                    physicalPath = "${domainModel}Fightable.h",
                    // struct → CLASS is an accepted improvement of the TSE migration over DC legacy
                    // (which emitted VALUECLASS). VALUECLASS has no downstream behavior in the resolver
                    // or levelizer; it was only a string label in cc.json.
                    nodeType = NodeType.CLASS,
                    dependencies = setOf(
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "domain", "model")
                    )
                )
            )
        )
    }

    override fun buildNoSuchCreatureExceptionResult(): ExpectedNode {
        val superResult = super.buildNoSuchCreatureExceptionResult()
        val node = superResult.nodes.first()
        return superResult.copy(
            nodes = listOf(
                node.copy(
                    physicalPath = "${domainModel}NoSuchCreatureException.h",
                    nodeType = NodeType.CLASS,
                    dependencies = setOf(
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "domain", "model"),
                        Dependency.simple("CreatureId.h")
                    ),
                    usedTypes = setOf(
                        Type.simple("runtime_error", typeOfUsage = TypeOfUsage.INHERITANCE),
                        Type.simple("CreatureId", typeOfUsage = TypeOfUsage.ARGUMENT)
                    )
                )
            )
        )
    }

    override fun buildCreatureIdResult(): ExpectedNode {
        val superResult = super.buildCreatureIdResult()
        val node = superResult.nodes.first()
        return superResult.copy(
            nodes = listOf(
                node.copy(
                    physicalPath = "${domainModel}CreatureId.h",
                    nodeType = NodeType.CLASS,
                    dependencies = setOf(
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "domain", "model")
                    ),
                    usedTypes = emptySet()
                )
            )
        )
    }

    override fun buildCreatureUtilResult(): ExpectedNode {
        val superResult = super.buildCreatureUtilResult()
        val node = superResult.nodes.first()
        return superResult.copy(
            nodes = listOf(
                node.copy(
                    physicalPath = "${application}CreatureUtil.h",
                    // struct → CLASS is an accepted improvement of the TSE migration over DC legacy
                    // (which emitted VALUECLASS); see buildFightableResult for the full rationale.
                    nodeType = NodeType.CLASS,
                    dependencies = setOf(
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "application")
                    )
                )
            )
        )
    }
}
