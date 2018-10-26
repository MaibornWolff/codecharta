/*
 * Copyright (c) 2017, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package de.maibornwolff.codecharta.model

/**
 * Represents a path in a tree
 * may be seen as multiple edges in the tree of nodes
 */
data class Path(val edgesList: List<String>) {

    /**
     * @return true, if there are no edges in the path
     */
    val isTrivial: Boolean
        get() = edgesList.isEmpty()

    /**
     * @return true, if path consists of one or less edges
     */
    val isSingle: Boolean
        get() = edgesList.size <= 1

    constructor(vararg edges: String) : this(listOf(*edges))

    /**
     * @return first edge in path to node
     */
    val head: String
        get() = edgesList.firstOrNull() ?: ""


    /**
     * @return tail, i.e. the remaining path when the head is removed, if not leaf, trivial element if leaf
     */
    val tail: Path
        get() =
            if (isSingle) Path.trivialPath()
            else Path(edgesList.drop(1))

    /**
     * @return parent, i.e. the path without the last edge, if not trivial, trivial element if trivial
     */
    val parent: Path
        get() =
            if (isSingle) Path.trivialPath()
            else Path(edgesList.dropLast(1))

    /**
     * @param path that will be added after the present path
     * @return concatinated path
     */
    fun concat(path: Path): Path {
        return when {
            this.isTrivial -> path
            path.isTrivial -> this
            else -> Path(this.edgesList + path.edgesList)
        }
    }

    fun fittingEdgesFromTailWith(path: Path): Int {
        val size = this.edgesList.size
        val pathSize = path.edgesList.size
        val minSize = minOf(size, pathSize)

        return (0 until minSize).firstOrNull { this.edgesList[size - (it + 1)] != path.edgesList[pathSize - (it + 1)] }
                ?: minSize
    }

    companion object {

        fun trivialPath(): Path {
            return TRIVIAL
        }

        val TRIVIAL = Path(emptyList())
    }
}