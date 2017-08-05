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

import java.util.*;

public class Node extends Tree<String, Node> {

    private final String name;
    private final NodeType type;
    private Map<String, Object> attributes = new HashMap<>();
    private String link;
    private List<Node> children = new ArrayList<>();

    public Node(String name, NodeType type, Map<String, Object> attributes, String link, List<Node> children) {
        this.name = name;
        this.type = type;
        this.attributes = attributes;
        this.link = link;
        this.children = children;
    }

    public Node(String name, NodeType type) {
        this(name, type, new HashMap<>(), "", new ArrayList<>());
    }

    public Node(String name, NodeType type, Map<String, Object> attributes) {
        this(name, type, attributes, "", new ArrayList<>());
    }

    public Node(String name, NodeType type, Map<String, Object> attributes, String link) {
        this(name, type, attributes, link, new ArrayList<>());
    }

    public String getName() {
        return name;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public NodeType getType() {
        return type;
    }

    @Override
    public List<Node> getChildren() {
        return children;
    }

    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String toString() {
        return "Node{" +
                "name='" + name + '\'' +
                ", type=" + type +
                ", attributes=" + attributes +
                ", link='" + link + '\'' +
                ", children=" + children +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Node node = (Node) o;

        if (name != null ? !name.equals(node.name) : node.name != null) return false;
        if (type != node.type) return false;
        if (attributes != null ? !attributes.equals(node.attributes) : node.attributes != null) return false;
        if (link != null ? !link.equals(node.link) : node.link != null) return false;
        return children != null ? children.equals(node.children) : node.children == null;
    }

    @Override
    public int hashCode() {
        int result = name != null ? name.hashCode() : 0;
        result = 31 * result + (type != null ? type.hashCode() : 0);
        result = 31 * result + (attributes != null ? attributes.hashCode() : 0);
        result = 31 * result + (link != null ? link.hashCode() : 0);
        result = 31 * result + (children != null ? children.hashCode() : 0);
        return result;
    }

    @Override
    public Path<String> getPathOfChild(final Tree<String, Node> child) {
        if (!getChildren().contains(child)) {
            throw new NoSuchElementException("Child " + child + " not contained in Node.");
        }
        return new Path<String>() {
            @Override
            public String head() {
                return ((Node) child).getName();
            }

            @Override
            public Path<String> tail() {
                return Path.trivialPath();
            }
        };
    }
}