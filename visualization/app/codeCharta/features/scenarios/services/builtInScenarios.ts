import { Scenario } from "../model/scenario.model"

const defaultMapColors = {
    positive: "#69AE40",
    neutral: "#ddcc00",
    negative: "#820E0E"
}

export const BUILT_IN_SCENARIOS: Scenario[] = [
    {
        id: "built-in-rloc",
        name: "Real Lines of Code",
        description: "Visualize code size using real lines of code",
        createdAt: 0,
        isBuiltIn: true,
        sections: {
            metrics: { areaMetric: "rloc", heightMetric: "rloc", colorMetric: "rloc" },
            colors: { colorRange: { from: 250, to: 500 }, mapColors: defaultMapColors }
        }
    },
    {
        id: "built-in-complexity",
        name: "Complexity",
        description: "Visualize cyclomatic complexity",
        createdAt: 0,
        isBuiltIn: true,
        sections: {
            metrics: { areaMetric: "rloc", heightMetric: "complexity", colorMetric: "complexity" },
            colors: { colorRange: { from: 50, to: 100 }, mapColors: defaultMapColors }
        }
    },
    {
        id: "built-in-comment-lines",
        name: "Comment Lines",
        description: "Visualize comment density",
        createdAt: 0,
        isBuiltIn: true,
        sections: {
            metrics: { areaMetric: "rloc", heightMetric: "comment_lines", colorMetric: "comment_lines" },
            colors: { colorRange: { from: 50, to: 100 }, mapColors: defaultMapColors }
        }
    },
    {
        id: "built-in-code-smells",
        name: "Code Smells",
        description: "Visualize code smell density",
        createdAt: 0,
        isBuiltIn: true,
        sections: {
            metrics: { areaMetric: "rloc", heightMetric: "code_smell", colorMetric: "code_smell" },
            colors: { colorRange: { from: 10, to: 50 }, mapColors: defaultMapColors }
        }
    },
    {
        id: "built-in-logic-complexity",
        name: "Logic Complexity",
        description: "Visualize cognitive/logic complexity",
        createdAt: 0,
        isBuiltIn: true,
        sections: {
            metrics: { areaMetric: "rloc", heightMetric: "logic_complexity", colorMetric: "logic_complexity" },
            colors: { colorRange: { from: 40, to: 80 }, mapColors: defaultMapColors }
        }
    },
    {
        id: "built-in-max-complexity-per-function",
        name: "Max Complexity per Function",
        description: "Visualize maximum complexity per function",
        createdAt: 0,
        isBuiltIn: true,
        sections: {
            metrics: { areaMetric: "rloc", heightMetric: "max_complexity_per_function", colorMetric: "max_complexity_per_function" },
            colors: { colorRange: { from: 10, to: 20 }, mapColors: defaultMapColors }
        }
    }
]
