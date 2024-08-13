package de.maibornwolff.codecharta.parser.svnlogparser.input.metrics

import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.parser.svnlogparser.input.Commit

class NumberOfAuthors : Metric {
    private val authors = mutableSetOf<String>()

    override fun description(): String {
        return "Number of Authors: Number of authors that contributed to this file."
    }

    override fun metricName(): String {
        return "number_of_authors"
    }

    override fun registerCommit(commit: Commit) {
        authors.add(commit.author)
    }

    override fun value(): Number {
        return authors.size
    }

    override fun attributeType(): AttributeType {
        return AttributeType.RELATIVE
    }
}
