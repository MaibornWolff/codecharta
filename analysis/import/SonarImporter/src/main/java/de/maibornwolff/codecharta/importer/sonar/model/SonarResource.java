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

package de.maibornwolff.codecharta.importer.sonar.model;

import com.google.common.base.Strings;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * see https://github.com/SonarSource/sonarqube/tree/master/sonar-plugin-api
 */
public class SonarResource {

    private final List<SonarAttribute> msr;
    private final String key;
    private final String name;
    private final Scope scope;
    private final Qualifier qualifier;
    private final String lname;

    public SonarResource(List<SonarAttribute> msr, String key, String name, Scope scope, Qualifier qualifier, String lname) {
        this.msr = msr;
        this.key = key;
        this.name = name;
        this.scope = scope;
        this.qualifier = qualifier;
        this.lname = lname;
    }

    public String getKey() {
        return key;
    }

    public String getName() {
        return name;
    }

    public String getLname() {
        return lname;
    }

    public Scope getScope() {
        return scope;
    }

    public Qualifier getQualifier() {
        return qualifier;
    }

    public List<SonarAttribute> getMsr() {
        return msr;
    }

    public boolean isProject() {
        return scope == Scope.PRJ && qualifier == Qualifier.TRK;
    }

    public boolean hasLName() {
        return !Strings.isNullOrEmpty(lname);
    }

    public Map<String, Object> getMsrAsMap() {
        return msr.stream().collect(Collectors.toMap(SonarAttribute::getKey, SonarAttribute::getVal));
    }
}
