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

object NodeInserter {
    /**
     * Inserts the node as child of the element at the specified position
     * in the sub-tree spanned by the children of the root node.
     *
     * @param root where another node should be inserted
     * @param path relative path to parent of new node in root node
     * @param node that has to be inserted
     */
    fun insertByPath(root: MutableNode, path: Path, node: MutableNode): MutableNode {
        if (path.isTrivial) {
            if (rootContainsNodeAlready(root, node)) {
                val original = getNode(root, node.name)!!
                root.children.remove(original)
                root.children.add(original.merge(listOf(node)))
            } else {
                root.children.add(node)
            }
        } else {
            val name = path.head
            val folderNode = getNode(root, name)
                    ?: root.insertNewFolderNode(name).getNodeBy(Path(name)) as MutableNode
            insertByPath(folderNode, path.tail, node)
        }
        return root
    }

    private fun getNode(root: MutableNode, name: String): MutableNode? {
        return root.children.firstOrNull { it.name == name }
    }

    private fun rootContainsNodeAlready(root: MutableNode, node: MutableNode): Boolean {
        return root.children.filter { it.name == node.name }.count() > 0
    }

    private fun createFolderNode(name: String): MutableNode {
        return MutableNode(name, NodeType.Folder)
    }

    private fun MutableNode.insertNewFolderNode(name: String): MutableNode {
        val folderNode = createFolderNode(name)
        insertByPath(this, Path.TRIVIAL, folderNode)
        return this
    }
}