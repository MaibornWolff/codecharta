<template>
  <div class="sample-component">
    <h1>{{ title }}</h1>
    <p v-if="showMessage">{{ message }}</p>
    <button @click="handleClick">Click me</button>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>

<script>
/**
 * A comprehensive sample Vue component demonstrating various features.
 * Used for golden file contract testing.
 */

// Component-level constant
const MAX_ITEMS = 10;

export default {
  name: 'SampleComponent',

  props: {
    initialCount: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      title: 'Vue Sample',
      message: 'Hello, World!',
      showMessage: true,
      counter: this.initialCount,
      items: []
    };
  },

  computed: {
    // Simple computed property
    doubleCounter() {
      return this.counter * 2;
    }
  },

  methods: {
    /** Simple method with no complexity */
    getCounter() {
      return this.counter;
    },

    // Calculate sum with validation and control flow
    calculate(a, b, c, d, e) {
      if (a < 0 || b < 0) {
        return 0;
      }
      let sum = 0;
      for (let i = 0; i < c; i++) {
        sum += a + b;
      }
      while (d > 0) {
        sum += d;
        d--;
      }
      return sum + e;
    },

    /*
     * A method that processes data with nested logic.
     * This tests complexity metrics.
     */
    processItems(items) {
      let result = "";
      let count = 0;
      for (const item of items) {
        if (item === null) {
          continue;
        }
        if (item.length === 0) {
          result += "empty";
        } else if (item.length > 10) {
          for (let i = 0; i < 3; i++) {
            result += item.substring(0, 5);
          }
        } else {
          result += item;
        }
        count++;
      }
      try {
        result += ` total: ${count}`;
      } catch (e) {
        return "error";
      }
      return result;
    },

    // Method chaining example (triggers message_chains metric)
    chainedCall(input) {
      return input?.trim()
        .split("")
        .filter(c => c !== " ")
        .join("")
        .toUpperCase();
    },

    /**
     * Demonstrates switch statement usage.
     * @param {number} type - the type identifier
     * @returns {string} formatted result string
     */
    formatByType(type) {
      let label;
      switch (type) {
        case 1:
          label = "one";
          break;
        case 2:
          label = "two";
          break;
        case 3:
          label = "three";
          break;
        default:
          label = "unknown";
      }
      return this.title + ": " + label;
    },

    // Event handler for click
    handleClick() {
      this.counter++;
      if (this.counter > MAX_ITEMS) {
        this.showMessage = false;
      }
    }
  }
};
</script>

<style scoped>
.sample-component {
  padding: 20px;
}
h1 {
  color: blue;
}
</style>
