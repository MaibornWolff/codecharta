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

import com.google.common.collect.ImmutableList;
import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.NodeType;
import de.maibornwolff.codecharta.model.Path;
import de.maibornwolff.codecharta.model.Project;
import org.hamcrest.BaseMatcher;
import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.junit.Test;

import static de.maibornwolff.codecharta.nodeinserter.NodeInserter.insertByPath;
import static org.hamcrest.Matchers.*;
import static org.junit.Assert.assertThat;

public class NodeInserterTest {
    private final Node root = new Node("root", NodeType.Folder);

    private Matcher<Node> hasNodeAtPath(final Node node, final String path) {
        return new BaseMatcher<Node>() {
            private Node nodeAtPath = null;

            @Override
            public void describeTo(Description description) {
                description.appendText("paths should contain ").appendValue(node).appendText(" at ").appendValue(path);
            }

            @Override
            public boolean matches(final Object item) {
                nodeAtPath = root.getNodeBy(new FileSystemPath(path));
                return nodeAtPath == null ? item == null : nodeAtPath.equals(node);
            }

            @Override
            public void describeMismatch(final Object item, final Description description) {
                description.appendText("but was ").appendValue(nodeAtPath);
                description.appendText(", where paths to leaves were ").appendValue(((Node) item).getPathsToLeafs());
            }
        };
    }

    @Test
    public void should_insert_node_in_leaf_position() {
        // given
        Node nodeForInsertion = new Node("insertedNode", NodeType.File);

        // when
        NodeInserter.insertByPath(root, new FileSystemPath(""), nodeForInsertion);

        // then
        assertThat(root.getChildren(), hasSize(1));
        assertThat(root.getPathsToLeafs(), hasSize(1));
        assertThat(root, hasNodeAtPath(nodeForInsertion, "insertedNode"));
    }

    @Test
    public void should_not_insert_node_in_leaf_position_twice() {
        // given
        Node nodeForInsertion = new Node("insertedNode", NodeType.File);
        Node secondNodeForInsertion = new Node("insertedNode", NodeType.Folder);
        NodeInserter.insertByPath(root, new FileSystemPath(""), nodeForInsertion);

        // when
        NodeInserter.insertByPath(root, new FileSystemPath(""), secondNodeForInsertion);

        // then
        assertThat(root.getChildren(), hasSize(1));
        assertThat(root.getPathsToLeafs(), hasSize(1));
        assertThat(root, hasNodeAtPath(nodeForInsertion, "insertedNode"));
    }

    @Test
    public void should_take_intermediate_node_in_inner_position_if_present() {
        // given
        Node nodeForInsertion = new Node("insertedNode", NodeType.File);
        Node intermediateNode = new Node("folder", NodeType.Folder);
        root.getChildren().add(intermediateNode);

        // when
        NodeInserter.insertByPath(root, new FileSystemPath("folder/"), nodeForInsertion);

        // then
        System.out.println(root);
        assertThat(root.getChildren(), hasSize(1));
        assertThat(root.getChildren(), hasItem(intermediateNode));
        assertThat(root.getPathsToLeafs(), hasSize(1));
        assertThat(root, hasNodeAtPath(nodeForInsertion, "folder/insertedNode"));
    }

    @Test
    public void should_insert_phantom_node_in_inner_position_if_no_intermediate_node_present() {
        // given
        Node nodeForInsertion = new Node("insertedNode", NodeType.File);
        Path position = new FileSystemPath("folder/");

        // when
        NodeInserter.insertByPath(root, position, nodeForInsertion);

        // then
        assertThat(root.getChildren(), hasSize(1));
        Node createdPhantomNode = root.getChildren().get(0);
        assertThat(createdPhantomNode.getName(), is("folder"));
    }

    @Test
    public void should_insert_node_in_end_position() {
        // given
        Node nodeForInsertion = new Node("insertedNode", NodeType.File);

        // when
        NodeInserter.insertByPath(root, new FileSystemPath("folder/subfolder/"), nodeForInsertion);

        // then
        assertThat(root.getChildren(), hasSize(1));
        assertThat(root.getPathsToLeafs(), hasSize(1));
        assertThat(root, hasNodeAtPath(nodeForInsertion, "folder/subfolder/insertedNode"));
    }

    @Test
    public void should_insert_node_in_end_position_even_if_ending_slash_not_present() {
        // given
        Node nodeForInsertion = new Node("insertedNode", NodeType.File);
        Path path = new FileSystemPath("folder/subfolder");

        // when
        NodeInserter.insertByPath(root, path, nodeForInsertion);

        // then
        assertThat(root.getChildren(), hasSize(1));
        assertThat(root.getPathsToLeafs(), hasSize(1));
        assertThat(root, hasNodeAtPath(nodeForInsertion, "folder/subfolder/insertedNode"));
    }

    @Test
    public void should_create_root_node_if_not_present() {
        // given
        Project project = new Project("someName");
        Node nodeForInsertion = new Node("someNode", NodeType.File);

        // when
        insertByPath(project, new FileSystemPath(""), nodeForInsertion);

        // then
        assertThat(project.getNodes(), hasSize(1));
        Node root = project.getRootNode();
        assertThat(root.getChildren(), hasSize(1));
        assertThat(root.getChildren().get(0), is(nodeForInsertion));
    }

    @Test
    public void should_use_root_node_if_present() {
        // given
        Node root = new Node("root", NodeType.File);
        Project project = new Project("someName", ImmutableList.of(root));
        Node nodeForInsertion = new Node("someNode", NodeType.File);

        // when
        insertByPath(project, new FileSystemPath(""), nodeForInsertion);

        // then
        assertThat(project.getNodes(), hasSize(1));
        assertThat(project.getRootNode(), is(root));
        assertThat(root.getChildren(), hasSize(1));
        assertThat(root.getChildren().get(0), is(nodeForInsertion));
    }
}