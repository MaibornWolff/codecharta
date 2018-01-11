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

package de.maibornwolff.codecharta.importer.scmlogparser.converter;

import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.NodeType;
import de.maibornwolff.codecharta.model.PathFactory;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile;
import de.maibornwolff.codecharta.nodeinserter.NodeInserter;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * creates Projects from List of VersionControlledFiles
 */
public class ProjectConverter {
    private static final char PATH_SEPARATOR = '/';
    private final boolean containsAuthors;

    public ProjectConverter(boolean containsAuthors) {
        this.containsAuthors = containsAuthors;
    }

    private void addVersionControlledFile(Project project, VersionControlledFile versionControlledFile) {
        Map<String, Object> attributes = extractAttributes(versionControlledFile);
        Node newNode = new Node(extractFilenamePart(versionControlledFile), NodeType.File, attributes, "", Collections.emptyList());
        NodeInserter.insertByPath(project, PathFactory.fromFileSystemPath(extractPathPart(versionControlledFile)), newNode);
    }

    private Map<String, Object> extractAttributes(VersionControlledFile versionControlledFile) {
        HashMap<String, Object> attributes = new HashMap<>(versionControlledFile.getMetricsMap());
        if (containsAuthors) {
            attributes.put("authors", versionControlledFile.getAuthors());
        }
        return attributes;
    }

    private String extractFilenamePart(VersionControlledFile versionControlledFile) {
        String path = versionControlledFile.getActualFilename();
        return path.substring(path.lastIndexOf(PATH_SEPARATOR) + 1);
    }

    private String extractPathPart(VersionControlledFile versionControlledFile) {
        String path = versionControlledFile.getActualFilename();
        return path.substring(0, path.lastIndexOf(PATH_SEPARATOR) + 1);
    }

    public Project convert(String projectName, List<VersionControlledFile> versionControlledFiles) {
        Project project = new Project(projectName);

        versionControlledFiles.stream()
                .filter(vc -> !vc.markedDeleted())
                .forEach(vcFile -> addVersionControlledFile(project, vcFile));

        return project;
    }
}
