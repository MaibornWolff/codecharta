package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.contract

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

class CSharpAnalysisPipelineTests : AnalysisPipelineContractTests() {
    override val language: SupportedLanguage = SupportedLanguage.C_SHARP
    override val rootDirectory: String = "src/test/resources/analysis/contract/examples/csharp"
    override val nodesBuilder: ExpectedNodesBuilder = SotsCSharpExpectedNodesBuilder()
}

class SotsCSharpExpectedNodesBuilder : SotsExpectedNodesBuilder() {
    override fun build(): List<ExpectedNode> {
        val expectedNodes = super.build()
        return expectedNodes.map { expectedNode ->
            expectedNode.copy(
                ignorableDependencies = setOf(
                    Dependency.asWildcard("Microsoft", "Extensions", "DependencyInjection")
                ),
                ignorableTypes = setOf(
                    Type.simple("List"),
                    Type.simple("Dictionary"),
                    Type.simple("int"),
                    Type.simple("string"),
                    Type.simple("Guid"),
                    Type.simple("Table"),
                    Type.simple("Key"),
                    Type.simple("TableAttribute"),
                    Type.simple("KeyAttribute"),
                    Type.simple("TKey"),
                    Type.simple("TEntity"),
                    Type.simple("void"),
                    Type.simple("Attribute"),
                    Type.simple("AttributeTargets"),
                    Type.simple("AttributeUsage"),
                    Type.simple("AttributeUsageAttribute"),
                    Type.simple("void"),
                    Type.simple("Exception")
                )
            )
        }
    }

    override fun buildFightableResult(): ExpectedNode {
        val result = super.buildFightableResult()
        val node = result.nodes.first()
        return result.copy(
            nodes = listOf(
                node.copy(
                    nodeType = NodeType.CLASS
                )
            )
        )
    }

    override fun buildPersistedCreaturesResult(): ExpectedNode {
        val result = super.buildPersistedCreaturesResult()
        val node = result.nodes.first()
        return result.copy(
            nodes = listOf(
                node.copy(
                    nodeType = NodeType.CLASS,
                    dependencies = setOf(
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "domain", "model"),
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "domain", "service"),
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "adapter", "persistence")
                    )
                )
            )
        )
    }

    override fun buildArmorClassResult(): ExpectedNode {
        val result = super.buildArmorClassResult()
        val node = result.nodes.first()
        return result.copy(
            nodes = listOf(
                node.copy(
                    nodeType = NodeType.CLASS,
                    dependencies = setOf(
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "domain", "model"),
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "application")
                    )
                )
            )
        )
    }

    override fun buildCreatureFacadeResult(): ExpectedNode {
        val result = super.buildCreatureFacadeResult()
        val node = result.nodes.first()
        return result.copy(
            nodes = listOf(
                node.copy(
                    nodeType = NodeType.CLASS,
                    dependencies = setOf(
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "domain", "model"),
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "domain", "service"),
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "application")
                    )
                )
            )
        )
    }

    override fun buildCreaturesResult(): ExpectedNode {
        val result = super.buildCreaturesResult()
        val node = result.nodes.first()
        return result.copy(
            nodes = listOf(
                node.copy(
                    dependencies = setOf(
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

    override fun buildNoSuchCreatureExceptionResult(): ExpectedNode {
        val result = super.buildNoSuchCreatureExceptionResult()
        val node = result.nodes.first()
        return result.copy(
            nodes = listOf(
                node.copy(
                    dependencies = setOf(
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "domain", "model")
                    ),
                    usedTypes = setOf(
                        Type.simple("CreatureId")
                    )
                )
            )
        )
    }

    override fun buildCreatureUtilResult(): ExpectedNode {
        val result = super.buildCreatureUtilResult()
        val node = result.nodes.first()
        return result.copy(
            nodes = listOf(
                node.copy(
                    dependencies = setOf(
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "domain", "model"),
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "domain", "service"),
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "application")
                    )
                )
            )
        )
    }

    override fun buildCreatureResult(): ExpectedNode {
        val result = super.buildCreatureResult()
        val node = result.nodes.first()
        return result.copy(
            nodes = listOf(
                node.copy(
                    dependencies = setOf(
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "domain", "model"),
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "application")
                    )
                )
            )
        )
    }

    override fun buildCreatureServiceResult(): ExpectedNode {
        val result = super.buildCreatureServiceResult()
        val node = result.nodes.first()
        return result.copy(
            nodes = listOf(
                node.copy(
                    dependencies = setOf(
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "domain", "model"),
                        Dependency.asWildcard("de", "sots", "cellarsandcentaurs", "domain", "service")
                    )
                )
            )
        )
    }
}
