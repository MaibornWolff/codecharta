<template>
  <div class="user-card">
    <h2>{{ user.name }}</h2>
    <p v-if="user.email">{{ user.email }}</p>
    <p v-else>No email provided</p>
    <ul v-for="item in items" :key="item.id">
      <li>{{ item.text }}</li>
    </ul>
    <button @click="handleClick">Click me</button>
  </div>
</template>

<script>
/**
 * A sample Vue component for testing the UnifiedParser
 */
export default {
  name: 'UserCard',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      items: [],
      isLoading: false
    };
  },
  computed: {
    /**
     * Returns a formatted display name
     */
    displayName() {
      if (this.user.firstName && this.user.lastName) {
        return `${this.user.firstName} ${this.user.lastName}`;
      } else if (this.user.name) {
        return this.user.name;
      }
      return 'Unknown User';
    },
    hasItems() {
      return this.items.length > 0;
    }
  },
  methods: {
    /**
     * Handles button click events
     */
    handleClick() {
      this.$emit('click', this.user);
    },
    /**
     * Fetches items from the API
     * @param {number} userId - The user ID to fetch items for
     */
    async fetchItems(userId) {
      this.isLoading = true;
      try {
        const response = await fetch(`/api/users/${userId}/items`);
        if (response.ok) {
          this.items = await response.json();
        } else {
          console.error('Failed to fetch items');
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * Validates user data
     */
    validateUser(user) {
      if (!user) {
        return false;
      }
      if (!user.name || user.name.trim() === '') {
        return false;
      }
      if (user.email && !this.isValidEmail(user.email)) {
        return false;
      }
      return true;
    },
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  },
  mounted() {
    if (this.user && this.user.id) {
      this.fetchItems(this.user.id);
    }
  }
};
</script>

<style scoped>
.user-card {
  padding: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

h2 {
  margin-top: 0;
  color: #333;
}

button {
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
