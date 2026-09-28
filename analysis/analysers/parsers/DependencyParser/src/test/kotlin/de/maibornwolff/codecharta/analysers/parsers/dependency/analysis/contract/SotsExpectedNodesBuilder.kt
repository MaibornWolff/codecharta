package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.contract

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.build

interface ExpectedNodesBuilder {
    fun build(): List<ExpectedNode>
}

data class ExpectedNode(
    val fileName: String,
    val nodes: List<Node>,
    val ignorableDependencies: Set<Dependency> = emptySet(),
    val ignorableTypes: Set<Type> = emptySet()
)

abstract class SotsExpectedNodesBuilder : ExpectedNodesBuilder {
    override fun build(): List<ExpectedNode> = listOf(
        buildCreatureEntityResult(),
        buildCreatureRepositoryResult(),
        buildPersistedCreaturesResult(),
        buildArmorClassResult(),
        buildCreatureFacadeResult(),
        buildCreaturesResult(),
        buildFightableResult(),
        buildNoSuchCreatureExceptionResult(),
        buildCreatureIdResult(),
        buildCreatureTypeResult(),
        buildSpeedResult(),
        buildCreatureUtilResult(),
        buildSpeedTypeResult(),
        buildHitPointsResult(),
        buildCreatureResult(),
        buildCreatureServiceResult()
    )

    protected fun buildCreatureEntityResult() = ExpectedNode(
        "CreatureEntity",
        listOf(
            Node.build(
                pathWithName = Path(
                    "de",
                    "sots",
                    "cellarsandcentaurs",
                    "adapter",
                    "persistence",
                    "CreatureEntity"
                ),
                nodeType = NodeType.CLASS,
                dependencies = setOf(
                    Dependency(
                        Path("de", "sots", "cellarsandcentaurs", "adapter", "persistence"),
                        isWildcard = true
                    )
                ),
                usedTypes = emptySet()
            )
        )
    )

    protected open fun buildCreatureRepositoryResult() = ExpectedNode(
        "CreatureRepository",
        listOf(
            Node.build(
                pathWithName = Path(
                    "de",
                    "sots",
                    "cellarsandcentaurs",
                    "adapter",
                    "persistence",
                    "CreatureRepository"
                ),
                nodeType = NodeType.INTERFACE,
                dependencies = setOf(
                    Dependency(
                        Path("de", "sots", "cellarsandcentaurs", "adapter", "persistence"),
                        isWildcard = true
                    )
                ),
                usedTypes = emptySet()
            )
        )
    )

    protected open fun buildPersistedCreaturesResult() = ExpectedNode(
        "PersistedCreatures",
        listOf(
            Node.build(
                pathWithName = Path("de", "sots", "cellarsandcentaurs", "adapter", "persistence", "PersistedCreatures"),
                nodeType = NodeType.CLASS,
                dependencies = setOf(
                    Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model", "Creature")),
                    Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model", "CreatureId")),
                    Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model", "NoSuchCreatureException")),
                    Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "service", "Creatures")),
                    Dependency(
                        Path("de", "sots", "cellarsandcentaurs", "adapter", "persistence"),
                        isWildcard = true
                    )
                ),
                usedTypes = setOf(
                    Type.simple("CreatureRepository"),
                    Type.simple("Creature"),
                    Type.simple("Creatures"),
                    Type.simple("NoSuchCreatureException"),
                    Type.simple("CreatureId"),
                    Type.simple("CreatureEntity")
                )
            )
        )
    )

    protected open fun buildArmorClassResult() = ExpectedNode(
        "ArmorClass",
        listOf(
            Node.build(
                pathWithName = Path("de", "sots", "cellarsandcentaurs", "domain", "model", "ArmorClass"),
                nodeType = NodeType.CLASS,
                dependencies = setOf(
                    Dependency(
                        Path(
                            "de",
                            "sots",
                            "cellarsandcentaurs",
                            "application",
                            "CreatureUtil"
                        )
                    ),
                    Dependency(
                        Path(
                            "de",
                            "sots",
                            "cellarsandcentaurs",
                            "domain",
                            "model"
                        ),
                        isWildcard = true
                    )
                ),
                usedTypes = setOf(Type.simple("CreatureUtil"))
            )
        )
    )

    protected open fun buildCreatureFacadeResult() = ExpectedNode(
        "CreatureFacade",
        listOf(
            Node.build(
                pathWithName = Path("de", "sots", "cellarsandcentaurs", "application", "CreatureFacade"),
                nodeType = NodeType.CLASS,
                dependencies = setOf(
                    Dependency(
                        Path(
                            "de",
                            "sots",
                            "cellarsandcentaurs",
                            "domain",
                            "model",
                            "ArmorClass"
                        )
                    ),
                    Dependency(
                        Path(
                            "de",
                            "sots",
                            "cellarsandcentaurs",
                            "domain",
                            "model",
                            "Creature"
                        )
                    ),
                    Dependency(
                        Path(
                            "de",
                            "sots",
                            "cellarsandcentaurs",
                            "domain",
                            "model",
                            "CreatureType"
                        )
                    ),
                    Dependency(
                        Path(
                            "de",
                            "sots",
                            "cellarsandcentaurs",
                            "domain",
                            "model",
                            "HitPoints"
                        )
                    ),
                    Dependency(
                        Path(
                            "de",
                            "sots",
                            "cellarsandcentaurs",
                            "domain",
                            "model",
                            "Speed"
                        )
                    ),
                    Dependency(
                        Path(
                            "de",
                            "sots",
                            "cellarsandcentaurs",
                            "domain",
                            "model",
                            "SpeedType"
                        )
                    ),
                    Dependency(
                        Path(
                            "de",
                            "sots",
                            "cellarsandcentaurs",
                            "domain",
                            "service",
                            "CreatureService"
                        )
                    ),
                    Dependency(
                        Path(
                            "java",
                            "util",
                            "Map"
                        )
                    ),
                    Dependency(
                        Path(
                            "de",
                            "sots",
                            "cellarsandcentaurs",
                            "application"
                        ),
                        isWildcard = true
                    )
                ),
                usedTypes = setOf(
                    Type.simple("CreatureType"),
                    Type.simple("HitPoints"),
                    Type.simple("SpeedType"),
                    Type.simple("Creature"),
                    Type.simple("CreatureId"),
                    Type.simple("CreatureService"),
                    Type.simple("Speed"),
                    Type.simple("ArmorClass")
                )
            )
        )
    )

    protected open fun buildCreaturesResult() = ExpectedNode(
        "Creatures",
        listOf(
            Node.build(
                pathWithName = Path(
                    "de",
                    "sots",
                    "cellarsandcentaurs",
                    "domain",
                    "service",
                    "Creatures"
                ),
                nodeType = NodeType.INTERFACE,
                dependencies = setOf(
                    Dependency(
                        Path(
                            "de",
                            "sots",
                            "cellarsandcentaurs",
                            "domain",
                            "model",
                            "Creature"
                        )
                    ),
                    Dependency(
                        Path(
                            "de",
                            "sots",
                            "cellarsandcentaurs",
                            "domain",
                            "model",
                            "CreatureId"
                        )
                    ),
                    Dependency(
                        Path(
                            "de",
                            "sots",
                            "cellarsandcentaurs",
                            "domain",
                            "model",
                            "NoSuchCreatureException"
                        )
                    ),
                    Dependency(
                        Path(
                            "de",
                            "sots",
                            "cellarsandcentaurs",
                            "domain",
                            "service"
                        ),
                        isWildcard = true
                    )
                ),
                usedTypes = setOf(
                    Type.simple("NoSuchCreatureException"),
                    Type.simple("Creature"),
                    Type.simple("CreatureId")
                )
            )
        )
    )

    protected open fun buildFightableResult() = ExpectedNode(
        "Fightable",
        listOf(
            Node.build(
                pathWithName = Path("de", "sots", "cellarsandcentaurs", "domain", "model", "Fightable"),
                dependencies = setOf(
                    Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model"), isWildcard = true)
                )
            )
        )
    )

    protected open fun buildNoSuchCreatureExceptionResult() = ExpectedNode(
        "NoSuchCreatureException",
        listOf(
            Node.build(
                pathWithName = Path("de", "sots", "cellarsandcentaurs", "domain", "model", "NoSuchCreatureException"),
                nodeType = NodeType.CLASS,
                dependencies = setOf(
                    Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model"), isWildcard = true)
                ),
                usedTypes = setOf(Type.simple("RuntimeException"), Type.simple("CreatureId"))
            )
        )
    )

    protected open fun buildCreatureIdResult() = ExpectedNode(
        "CreatureId",
        listOf(
            Node.build(
                pathWithName = Path("de", "sots", "cellarsandcentaurs", "domain", "model", "CreatureId"),
                nodeType = NodeType.CLASS,
                dependencies = setOf(
                    Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model"), isWildcard = true)
                ),
                usedTypes = emptySet()
            )
        )
    )

    protected fun buildCreatureTypeResult() = ExpectedNode(
        "CreatureType",
        listOf(
            Node.build(
                pathWithName = Path("de", "sots", "cellarsandcentaurs", "domain", "model", "CreatureType"),
                nodeType = NodeType.ENUM,
                dependencies = setOf(
                    Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model"), isWildcard = true)
                ),
                usedTypes = emptySet()
            )
        )
    )

    protected fun buildSpeedResult() = ExpectedNode(
        "Speed",
        listOf(
            Node.build(
                pathWithName = Path("de", "sots", "cellarsandcentaurs", "domain", "model", "Speed"),
                nodeType = NodeType.CLASS,
                dependencies = setOf(
                    Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model"), isWildcard = true)
                ),
                usedTypes = emptySet()
            )
        )
    )

    protected open fun buildCreatureUtilResult() = ExpectedNode(
        "CreatureUtil",
        listOf(
            Node.build(
                pathWithName = Path("de", "sots", "cellarsandcentaurs", "application", "CreatureUtil"),
                nodeType = NodeType.CLASS,
                dependencies = setOf(
                    Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model", "CreatureType")),
                    Dependency(Path("de", "sots", "cellarsandcentaurs", "application"), isWildcard = true)
                ),
                usedTypes = emptySet()
            )
        )
    )

    protected fun buildSpeedTypeResult() = ExpectedNode(
        "SpeedType",
        listOf(
            Node.build(
                pathWithName = Path("de", "sots", "cellarsandcentaurs", "domain", "model", "SpeedType"),
                nodeType = NodeType.ENUM,
                dependencies = setOf(
                    Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model"), isWildcard = true)
                ),
                usedTypes = emptySet()
            )
        )
    )

    protected fun buildHitPointsResult() = ExpectedNode(
        "HitPoints",
        listOf(
            Node.build(
                pathWithName = Path("de", "sots", "cellarsandcentaurs", "domain", "model", "HitPoints"),
                nodeType = NodeType.CLASS,
                dependencies = setOf(
                    Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model"), isWildcard = true)
                ),
                usedTypes = setOf(Type.simple("HitPoints"))
            )
        )
    )

    protected open fun buildCreatureResult() = ExpectedNode(
        "Creature",
        listOf(
            Node.build(
                pathWithName = Path("de", "sots", "cellarsandcentaurs", "domain", "model", "Creature"),
                nodeType = NodeType.CLASS,
                dependencies = setOf(
                    Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model"), isWildcard = true)
                ),
                usedTypes = setOf(
                    Type.simple("CreatureId"),
                    Type.simple("CreatureType"),
                    Type.simple("ArmorClass"),
                    Type.simple("HitPoints"),
                    Type.generic(
                        "Map",
                        listOf(
                            Type.simple("SpeedType"),
                            Type.simple("Speed")
                        )
                    ),
                    Type.simple("HitPoints")
                )
            )
        )
    )

    protected open fun buildCreatureServiceResult() = ExpectedNode(
        "CreatureService",
        listOf(
            Node.build(
                pathWithName = Path("de", "sots", "cellarsandcentaurs", "domain", "service", "CreatureService"),
                nodeType = NodeType.CLASS,
                dependencies = setOf(
                    Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "model", "Creature")),
                    Dependency(Path("de", "sots", "cellarsandcentaurs", "domain", "service"), isWildcard = true)
                ),
                usedTypes = setOf(Type.simple("Creatures"), Type.simple("Creature"))
            )
        )
    )
}
