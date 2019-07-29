const state = {

    init: () => global.state = {
        projects: [],
        analysis: [],
        count: 0,
        script: ""
    },

    addProject: (name, path, source) => global.state.projects.push({
        name: name,
        path: path,
        source: source
    }),

    addAnalysis: (file, type, projects) => global.state.analysis.push({
        file: file,
        type: type,
        projects: projects,
    }),

    getAnalysisChoices: () => global.state.analysis.map(a=>{
        return {
            name: `${a.type} from ${a.projects.map(p=>`${p.name} (${p.source})`).join(", ")}`,
            value: a
        }
    }),

    hasProjects: () => global.state.projects.length > 0,

    getProjectChoices: () => global.state.projects.map(p=>{
        return {
            name: `${p.name} (${p.source})`,
            value: p
        }
    }),

    hasAnalysis: () => global.state.analysis.length > 0,

    nextInteger: () => global.state.count++,

    appendScriptLine: (line) => global.state.script += `${line}\n`,

    makeLine: (line) => `${line}\n`,

    appendComment: (comment) => global.state.script += `\n# ${comment}\n`,
    
    makeComment: (comment) =>`\n# ${comment}\n`,

    getScript: () => 
    state.makeComment("create tmp dir and go into it")
    +state.makeLine("mkdir tmp")
    +state.makeLine("cd tmp") 
    +state.makeComment("begin building maps")
    +global.state.script
    +state.makeComment("cleanup and move maps into maps dir")
    +state.makeLine("cd ..")
    +state.makeLine("mkdir maps")
    +state.makeLine("mv tmp/*.cc.json maps")
    +state.makeLine("rm -rf tmp")
}

module.exports = state;
