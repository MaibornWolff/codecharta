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

package de.maibornwolff.codecharta.nodeinserter;

import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.NodeType;
import de.maibornwolff.codecharta.model.Path;
import de.maibornwolff.codecharta.model.Project;

import java.util.Optional;

/**
 * Inserts a new node into a project.
 * <p>
 * The nodes of a project span a tree using their parent children relationship.
 * A path in this tree is represented by the ordered list of names of nodes.
 */
public final class NodeInserter {
    private NodeInserter() {
        // Utility Class
    }

    /**
     * Inserts the node as child of the element at the specified position in the tree.
     *
     * @param project  where the node has to be inserted
     * @param position absolute path to the parent element of the node that has to be inserted
     * @param node     that has to be inserted
     */
    public static void insertByPath(Project project, Path position, Node node) {
        if (!project.hasRootNode()) {
            project.getNodes().add(createFolderNode("root"));
        }

        insertByPath(project.getRootNode(), position, node);
    }

    /**
     * Inserts the node as child of the element at the specified position
     * in the sub-tree spanned by the children of the root node.
     *
     * @param root where another node should be inserted
     * @param path relative path to parent of new node in root node
     * @param node that has to be inserted
     */
    public static void insertByPath(Node root, Path path, Node node) {
        if (path.isTrivial()) {
            if (rootContainsNodeAlready(root, node)) {
                System.err.println("Element " + path + " already exists, skipping.");
                return;
            }
            root.getChildren().add(node);
        } else {
            String name = path.head().toString();
            Node folderNode = getFolderNode(root, name).orElseGet(() -> createFolderNodeAndInsertAtRoot(root, name));
            insertByPath(folderNode, path.tail(), node);
        }
    }


    private static Node createFolderNodeAndInsertAtRoot(Node root, String name) {
        Node folderNode;
        folderNode = createFolderNode(name);
        insertByPath(root, Path.TRIVIAL, folderNode);
        return folderNode;
    }

    private static Optional<Node> getFolderNode(Node root, String name) {
        return root.getChildren().stream()
                .filter(c -> c.getName().equals(name))
                .findFirst();
    }

    private static boolean rootContainsNodeAlready(Node root, Node node) {
        return root.getChildren().stream().filter(n -> n.getName().equals(node.getName())).count() > 0;
    }

    private static Node createFolderNode(String name) {
        return new Node(name, NodeType.Folder);
    }

}
