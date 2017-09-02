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
package de.maibornwolff.codecharta.model;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * tree structure
 *
 * @param <T> must satisfy T = Tree<T>
 */
public abstract class Tree<T extends Tree> {
    /**
     * @return children of the present tree
     */
    public abstract List<? extends Tree<T>> getChildren();

    /**
     * get's the path of a given child, i.e. defines the edge to the child.
     *
     * @param child to be found
     * @return path of child in this object
     */
    public abstract Path getPathOfChild(Tree<T> child);

    public final boolean isLeaf() {
        List<? extends Tree<T>> children = getChildren();
        return children == null || children.isEmpty();
    }

    private static final class TreeNode<V> {
        TreeNode(Path path, V node) {
            this.path = path;
            this.node = node;
        }

        final Path path;
        final V node;
    }

    protected Stream<TreeNode<T>> getTreeNodes() {
        return
                Stream.concat(Stream.of(new TreeNode<>(Path.trivialPath(), (T) this)),
                        getChildren().stream()
                                .flatMap(child -> child.getTreeNodes()
                                        .map(entry -> new TreeNode<>(getPathOfChild(child).concat(entry.path), entry.node))
                                ));
    }

    public Map<Path, T> getNodes() {
        return getTreeNodes().collect(Collectors.toMap(n -> n.path, n -> n.node));
    }

    public Map<Path, T> getLeaves() {
        return getTreeNodes().filter(n -> n.node.isLeaf()).collect(Collectors.toMap(n -> n.path, n -> n.node));
    }

    /**
     * @return all leafs of object
     */
    public Stream<T> getLeafObjects() {
        return getTreeNodes().filter(n -> n.node.isLeaf()).map(n -> n.node);
    }

    /**
     * @return all paths to leafs of object
     */
    public Stream<Path> getPathsToLeaves() {
        return getTreeNodes().filter(n -> n.node.isLeaf()).map(n -> n.path);
    }

    /**
     * @param path path in tree
     * @return subtree under this path
     */
    public Optional<? extends Tree<T>> getNodeBy(Path path) {
        if (path.isTrivial()) {
            return Optional.of(this);
        }
        if (path.isSingle()) {
            return getChildren().stream()
                    .filter(child -> path.equals(getPathOfChild(child)))
                    .findFirst();
        }
        Path pathToDirectChild = new Path(Collections.singletonList(path.head()));
        return this.getNodeBy(pathToDirectChild).get().getNodeBy(path.tail());
    }
}
