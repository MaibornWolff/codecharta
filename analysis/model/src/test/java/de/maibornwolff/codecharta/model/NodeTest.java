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

import com.google.common.collect.ImmutableMap;
import org.junit.Test;

import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import static org.hamcrest.CoreMatchers.hasItem;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.hasSize;

public class NodeTest {

    @Test
    public void getPathOfChild_of_valid_child_should_return_path() {
        // given
        Node node11 = new Node("node11", NodeType.File);
        List<Node> node1Children = Arrays.asList(node11);
        Node root = new Node("node1", NodeType.Folder, ImmutableMap.of(), "", node1Children);

        // when
        Path pathOfChild = root.getPathOfChild(node11);

        // then
        assertThat(pathOfChild.isSingle(), is(true));
        assertThat(pathOfChild.head(), is("node11"));
    }

    @Test(expected = NoSuchElementException.class)
    public void getPathOfChild_of_invalid_child_should_throw_exception() {
        // given
        Node node11 = new Node("node11", NodeType.File);
        List<Node> node1Children = Arrays.asList(node11);
        Node root = new Node("node1", NodeType.Folder, ImmutableMap.of(), "", node1Children);

        // when
        root.getPathOfChild(new Node("node11", NodeType.Folder));

        // then throw
    }

    @Test
    public void getLeafs_should_return_leafs() {
        // given
        Node node11 = new Node("node11", NodeType.File);
        Node node12 = new Node("node12", NodeType.File);
        List<Node> node1Children = Arrays.asList(node11, node12);
        Node node1 = new Node("node1", NodeType.Folder, ImmutableMap.of(), "", node1Children);
        Node node21 = new Node("node21", NodeType.Folder);
        List<Node> node2Children = Arrays.asList(node21);
        Node node2 = new Node("node2", NodeType.Folder, ImmutableMap.of(), "", node2Children);
        Node root = new Node("root", NodeType.Folder, ImmutableMap.of(), "", Arrays.asList(node1, node2));

        // when
        List<Node> leafs = root.getLeafObjects().collect(Collectors.toList());

        // then
        assertThat(leafs, hasSize(3));
        assertThat(leafs, hasItem(node11));
        assertThat(leafs, hasItem(node12));
        assertThat(leafs, hasItem(node21));
    }

    @Test
    public void getPathsToLeafs_of_simple_tree() {
        // given
        Node node1 = new Node("node1", NodeType.Folder);
        Path pathToNode1 = new Path("node1");
        Node root = new Node("root", NodeType.Folder, ImmutableMap.of(), "", Arrays.asList(node1));

        // when
        List<Path> pathsToLeafs = root.getPathsToLeaves().collect(Collectors.toList());

        // then
        assertThat(pathsToLeafs, hasSize(1));
        assertThat(pathsToLeafs, PathMatcher.containsPath(pathToNode1));
    }

    @Test
    public void getPathsToLeafs() {
        // given
        Node node11 = new Node("node11", NodeType.File);
        Path pathToNode11 = new Path("node1", "node11");
        Node node12 = new Node("node12", NodeType.File);
        Path pathToNode12 = new Path("node1", "node12");
        List<Node> node1Children = Arrays.asList(node11, node12);
        Node node1 = new Node("node1", NodeType.Folder, ImmutableMap.of(), "", node1Children);
        Node node21 = new Node("node21", NodeType.Folder);
        Path pathToNode21 = new Path("node2", "node21");
        List<Node> node2Children = Arrays.asList(node21);
        Node node2 = new Node("node2", NodeType.Folder, ImmutableMap.of(), "", node2Children);
        Node root = new Node("root", NodeType.Folder, ImmutableMap.of(), "", Arrays.asList(node1, node2));

        // when
        List<Path> pathsToLeafs = root.getPathsToLeaves().collect(Collectors.toList());

        // then
        assertThat(pathsToLeafs, hasSize(3));
        assertThat(pathsToLeafs, PathMatcher.containsPath(pathToNode11));
        assertThat(pathsToLeafs, PathMatcher.containsPath(pathToNode12));
        assertThat(pathsToLeafs, PathMatcher.containsPath(pathToNode21));
    }
}