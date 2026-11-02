package de.maibornwolff.codecharta.analysers.parsers.gitlog.ownership

import java.util.Random

/**
 * Names people by their position in the repository's history, with word lists shuffled by its first commit. Walking both
 * lists in step uses no colour or animal twice until a list runs out, and as their sizes share no divisor, no pair repeats
 * before all of them are used. Changing a list renames everyone, so the lists are frozen.
 */
internal class AuthorPseudonyms(firstCommitHash: String) {
    private val colours: List<String>
    private val animals: List<String>

    init {
        val random = Random(firstCommitHash.hashCode().toLong())
        colours = COLOURS.shuffled(random)
        animals = ANIMALS.shuffled(random)
    }

    fun nameOf(position: Int): String {
        val pair = "${colours[position % colours.size].capitalised()} ${animals[position % animals.size].capitalised()}"
        val round = position / (colours.size * animals.size)
        return if (round == 0) pair else "$pair ${round + 1}"
    }

    private fun String.capitalised() = replaceFirstChar { it.uppercase() }

    companion object {
        val COLOURS = listOf(
            "amber", "apricot", "aqua", "azure", "bronze", "burgundy", "cerise", "cerulean", "claret", "cobalt", "copper", "coral",
            "crimson", "cyan", "denim", "emerald", "fern", "flax", "fuchsia", "garnet", "gold", "heather", "indigo", "iris", "jade",
            "jasper", "lapis", "lavender", "lilac", "lime", "magenta", "malachite", "marigold", "maroon", "mauve", "mint", "moss",
            "mulberry", "navy", "ochre", "olive", "onyx", "opal", "orchid", "pearl", "periwinkle", "pewter", "pine", "platinum",
            "plum", "quartz", "ruby", "russet", "saffron", "sage", "sapphire", "scarlet", "sepia", "sienna", "silver", "slate",
            "spruce", "tangerine", "teal", "terracotta", "topaz", "turquoise", "vermilion", "violet", "viridian", "wisteria"
        )
        val ANIMALS = listOf(
            "albatross", "antelope", "bison", "butterfly", "caribou", "cheetah", "condor", "crane", "deer", "dolphin", "dove",
            "dragonfly", "eagle", "egret", "elk", "falcon", "finch", "flamingo", "gazelle", "gecko", "giraffe", "hare", "hawk",
            "hedgehog", "heron", "hummingbird", "ibex", "impala", "jaguar", "kestrel", "kingfisher", "koala", "ladybird", "lark",
            "lemur", "leopard", "lion", "lynx", "macaw", "marten", "meerkat", "narwhal", "nightingale", "ocelot", "okapi", "osprey",
            "otter", "owl", "panda", "parrot", "pelican", "penguin", "puffin", "puma", "rabbit", "raven", "robin", "salamander",
            "sandpiper", "seahorse", "skylark", "sparrow", "springbok", "squirrel", "starling", "stork", "swan", "swift", "tiger",
            "toucan", "wolf", "wren", "zebra"
        )
    }
}
