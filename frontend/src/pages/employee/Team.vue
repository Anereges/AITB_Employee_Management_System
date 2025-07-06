<template>
  <div class="team-view">
    <h2><i class="fas fa-users mr-2"></i>Team Members</h2>
    
    <div class="search-bar">
      <input v-model="searchQuery" placeholder="Search team members..." />
      <i class="fas fa-search"></i>
    </div>

    <div v-if="loading" class="loading">Loading team members...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && !error" class="team-grid">
      <div v-for="member in filteredMembers" :key="member.id" class="team-card">
        <div class="avatar">
          <img :src="member.avatar" :alt="member.name" />
          <span class="status" :class="member.status"></span>
        </div>
        <div class="member-info">
          <h3>{{ member.name }}</h3>
          <p>{{ member.position }}</p>
          <div class="department">{{ member.department }}</div>
        </div>
        <div class="member-actions">
          <button class="btn-icon" @click="sendMessage(member.id)">
            <i class="fas fa-envelope"></i>
          </button>
          <button class="btn-icon" @click="viewProfile(member.id)">
            <i class="fas fa-user"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';

const toast = useToast();
const searchQuery = ref('');
const teamMembers = ref([]);
const loading = ref(false);
const error = ref(null);

// Replace with your actual API base URL
const API_BASE_URL = 'https://your-api-domain.com/api';

const fetchTeamMembers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get(`${API_BASE_URL}/team-members`);
    // Assuming API returns an array of members
    teamMembers.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load team members.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const filteredMembers = computed(() => {
  if (!searchQuery.value) return teamMembers.value;
  const query = searchQuery.value.toLowerCase();
  return teamMembers.value.filter(member =>
    member.name.toLowerCase().includes(query) ||
    member.position.toLowerCase().includes(query) ||
    member.department.toLowerCase().includes(query)
  );
});

const sendMessage = (id) => {
  const member = teamMembers.value.find(m => m.id === id);
  if (member) {
    // Implement real messaging logic here
    toast.info(`Message sent to ${member.name}`);
  }
};

const viewProfile = (id) => {
  const member = teamMembers.value.find(m => m.id === id);
  if (member) {
    // Implement real navigation to profile here
    toast.success(`Viewing profile of ${member.name}`);
  }
};

onMounted(() => {
  fetchTeamMembers();
});
</script>

<style scoped>
.team-view {
  padding: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.search-bar {
  position: relative;
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.search-bar input {
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border-radius: 6px;
  border: 1.5px solid #ddd;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-bar input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 6px #c7d2fe;
}

.search-bar i {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

.team-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 6px 15px rgb(0 0 0 / 0.1);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: box-shadow 0.3s ease;
}

.team-card:hover {
  box-shadow: 0 10px 25px rgb(0 0 0 / 0.15);
}

.avatar {
  position: relative;
  width: 90px;
  height: 90px;
  margin-bottom: 1rem;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #4f46e5;
}

.status {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid white;
}

.status.active {
  background-color: #10b981; /* green */
}

.status.away {
  background-color: #fbbf24; /* yellow */
}

.status.busy {
  background-color: #ef4444; /* red */
}

.member-info h3 {
  margin: 0;
  font-weight: 700;
  font-size: 1.1rem;
  color: #222;
}

.member-info p {
  margin: 0.25rem 0 0.5rem 0;
  font-size: 0.95rem;
  color: #555;
  font-style: italic;
}

.department {
  font-size: 0.85rem;
  color: #777;
  font-weight: 600;
}

.member-actions {
  margin-top: auto;
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: #4f46e5;
  border: none;
  color: white;
  padding: 0.5rem 0.7rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.btn-icon:hover {
  background-color: #4338ca;
}

.loading,
.error {
  text-align: center;
  margin: 2rem 0;
  font-weight: 600;
  color: #666;
}
.error {
  color: #ef4444;
}
</style>
