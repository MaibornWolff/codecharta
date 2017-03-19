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

package de.maibornwolff.codecharta.importer.sonar;

import de.maibornwolff.codecharta.importer.sonar.model.SonarResource;
import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.NodeType;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.nodeinserter.FileSystemPath;
import de.maibornwolff.codecharta.nodeinserter.NodeInserter;

import java.util.List;
import java.util.Optional;

public class SonarResourceToProjectConverter {

    private final List<SonarResource> sonarResources;

    private final String baseUrlForLink;

    SonarResourceToProjectConverter(List<SonarResource> sonarResources, String baseUrlForLink) {
        this.sonarResources = sonarResources;
        this.baseUrlForLink = baseUrlForLink;
    }


    public Project convert() throws IllegalArgumentException {
        Project project;
        Optional<SonarResource> firstProjectResource = sonarResources.stream().filter(SonarResource::isProject).findFirst();
        if (firstProjectResource.isPresent()) {
            project = new Project(firstProjectResource.get().getName());
        } else {
            throw new IllegalArgumentException("The project could not be created! No resource with Scope 'PRJ' and Qualifier 'TRK' found.");
        }

        createNodeStructureOfProject(project);

        return project;
    }


    private void createNodeStructureOfProject(Project project) {
        sonarResources.stream()
                .filter(res -> !res.isProject() && res.hasLName())
                .forEach(res -> addNodeToProject(project, res));
    }


    private void addNodeToProject(Project project, SonarResource resource) {
        String name = getNodeName(resource.getLname());
        Node node;

        switch (resource.getScope()) {
            case DIR:
                node = new Node(name, NodeType.Folder, resource.getMsrAsMap());
                break;
            case FIL:
                node = new Node(name, NodeType.File, resource.getMsrAsMap());
                break;
            default:
                System.err.println("Type " + resource.getQualifier() + " not known for key " + resource.getKey());
                return;
        }

        if (!baseUrlForLink.isEmpty()) {
            node.setLink(getSonarCodeLink(resource));
        }
        NodeInserter.insertByPath(project, new FileSystemPath(getParentPath(resource.getLname())), node);
    }

    private static String getNodeName(String path) {
        return path.substring(path.lastIndexOf('/') + 1);
    }

    private static String getParentPath(String path) {
        return path.substring(0, path.lastIndexOf('/') + 1);
    }

    private String getSonarCodeLink(SonarResource resource) {
        return baseUrlForLink + "/code/index?id=" + resource.getKey();
    }
}
