package de.maibornwolff.codecharta.model

class Dependency constructor(
        val node: String,
        private val nodeFilename: String,
        private val dependantNode: String,
        private val dependantNodeFilename: String,
        private val pairingRate: Int,
        private val averageRevs: Int
) {

    override fun toString(): String {
        return "Dependency(" +
                "node=$node," +
                "nodeFilename=$nodeFilename, " +
                "dependantNode=$dependantNode, " +
                "dependantNodeFilename=$dependantNodeFilename, " +
                "pairingRate=$pairingRate, " +
                "averageRevs=$averageRevs)"
    }
}