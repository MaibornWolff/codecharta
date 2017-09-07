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

import de.maibornwolff.codecharta.importer.sonar.model.Scope;
import de.maibornwolff.codecharta.importer.sonar.model.SonarResource;
import de.maibornwolff.codecharta.model.*;
import de.maibornwolff.codecharta.nodeinserter.NodeInserter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Deprecated
public class SonarResourceToProjectConverter {

    private final List<SonarResource> sonarResources;

    private final String baseUrlForLink;

    private final Map<String, String> modules = new HashMap<>();

    SonarResourceToProjectConverter(List<SonarResource> sonarResources, String baseUrlForLink) {
        this.sonarResources = sonarResources;
        this.baseUrlForLink = baseUrlForLink;
    }

    public Project convert() {
        Project project;

        List<SonarResource> sonarResourceModules = sonarResources.stream().filter(res -> res.getScope().equals(Scope.PRJ)).collect(Collectors.toList());
        project = createProject(sonarResourceModules);
        createModuleStructureOfProject(sonarResourceModules);
        createNodeStructureOfProject(project);

        return project;
    }

    private void createModuleStructureOfProject(List<SonarResource> sonarResourceModules) {
        sonarResourceModules.forEach(res -> modules.put(res.getKey(), res.getName()));
    }

    private Project createProject(List<SonarResource> sonarResourceModules) {
        Project project;
        Optional<SonarResource> projectResource = sonarResourceModules.stream().filter(SonarResource::isProject).findFirst();

        if (projectResource.isPresent()) {
            project = new Project(projectResource.get().getName());
        } else {
            throw new IllegalArgumentException("The project could not be created! No resource with Scope 'PRJ' and Qualifier 'TRK' found.");
        }
        return project;
    }


    private void createNodeStructureOfProject(Project project) {
        sonarResources.stream()
                .filter(res -> !res.isProject() && res.hasLName())
                .forEach(res -> addNodeToProject(project, res));
    }

    private NodeType getNodeTypeFromScope(Scope scope) {
        switch (scope) {
            case PRJ:
                return NodeType.Folder;
            case DIR:
                return NodeType.Folder;
            case FIL:
                return NodeType.File;
            default:
                System.err.println("Scope " + scope + " not known");
                return NodeType.Folder;
        }
    }

    private void addNodeToProject(Project project, SonarResource resource) {
        if (resource.getScope().equals(Scope.PRJ)) return;

        Node node = new Node(getNodeName(resource.getLname()), getNodeTypeFromScope(resource.getScope()), resource.getMsrAsMap());

        if (!baseUrlForLink.isEmpty()) {
            node.setLink(baseUrlForLink + "/code/index?id=" + resource.getKey());
        }
        NodeInserter.insertByPath(project, getParentPath(resource.getLname()), node);
    }

    private static String getNodeName(String path) {
        return path.substring(path.lastIndexOf('/') + 1);
    }

    private Path getParentPath(String lname) {
        return PathFactory.fromFileSystemPath(lname.substring(0, lname.lastIndexOf('/') + 1));
    }
}
