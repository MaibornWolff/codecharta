import pluginVue from 'eslint-plugin-vue'

// Flat config in an .mjs file.
export function lairRules(isStrict) {
  if (isStrict) {
    return { 'vue/no-unused-vars': 'error' }
  }
  return {}
}

export default [...pluginVue.configs['flat/essential'], { rules: lairRules(true) }]
