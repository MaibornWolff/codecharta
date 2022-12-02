package de.maibornwolff.codecharta.importer.codemaat

import de.maibornwolff.codecharta.model.AttributeDescriptor

fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val descriptors: MutableMap<String, AttributeDescriptor> = mutableMapOf()
    descriptors["pairingRate"] = AttributeDescriptor(
        "Pairing Rate",
        "Pairing rate gives a percentage value of the chance that given files are committed together",
        "Indicates that the given file is not often committed together with the other file",
        "Indicates the the given files are often committed together",
        "https://github.com/adamtornhill/code-maat#mining-logical-coupling"
    )
    descriptors["avgCommits"] = AttributeDescriptor(
        "Average Commits",
        "Average amount of commits in which the given files were included",
        "Indicates that a file is not committed often",
        "Indicates that a file is committed often",
        "https://github.com/adamtornhill/code-maat#mining-logical-coupling"
    )
    return descriptors.toMap()
}
