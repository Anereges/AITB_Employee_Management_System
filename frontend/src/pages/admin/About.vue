<template>
  <div class="about-page">
    <div class="page-header">
      <h1 class="page-title">About AITB Employee Management System</h1>
      <p class="page-subtitle">Streamlining HR processes for a more efficient workforce</p>
    </div>
    
    <div class="about-content">
      <!-- System Overview Card -->
      <div class="about-card animate__animated animate__fadeInUp">
        <div class="about-icon">
          <i class="fas fa-info-circle"></i>
        </div>
        <h3>System Overview</h3>
        <p class="card-description">
          The AITB Employee Management System is a comprehensive HR solution designed to automate and optimize 
          all aspects of human resource management, from recruitment to retirement.
        </p>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Version</span>
            <span class="info-value">3.1.0</span>
          </div>
          <div class="info-item">
            <span class="info-label">Last Updated</span>
            <span class="info-value">May 6, 2025</span>
          </div>
          <div class="info-item">
            <span class="info-label">Developed For</span>
            <span class="info-value">AITB Organization</span>
          </div>
          <div class="info-item">
            <span class="info-label">License</span>
            <span class="info-value">Enterprise License</span>
          </div>
          <div class="info-item">
            <span class="info-label">Active Users</span>
            <span class="info-value">1,250+</span>
          </div>
          <div class="info-item">
            <span class="info-label">Modules</span>
            <span class="info-value">12</span>
          </div>
        </div>
      </div>
      
      <!-- Key Features Card -->
      <div class="about-card animate__animated animate__fadeInUp animate__delay-1s">
        <div class="about-icon">
          <i class="fas fa-star"></i>
        </div>
        <h3>Key Features</h3>
        <div class="features-list">
          <div class="feature-item" v-for="(feature, index) in features" :key="index">
            <i class="fas fa-check-circle feature-icon"></i>
            <span>{{ feature }}</span>
          </div>
        </div>
      </div>
      
      <!-- Team Card -->
      <div class="about-card animate__animated animate__fadeInUp animate__delay-2s">
        <div class="about-icon">
          <i class="fas fa-users"></i>
        </div>
        <h3>Development Team</h3>
        <p class="card-description">
          Our dedicated team of professionals who made this system possible:
        </p>
        <div class="team-grid">
          <div v-for="member in team" :key="member.name" class="team-member">
            <div class="avatar-container">
              <img :src="member.avatar" :alt="member.name" class="member-avatar">
              <div class="avatar-hover">
                <a v-if="member.linkedin" :href="member.linkedin" target="_blank"><i class="fab fa-linkedin"></i></a>
                <a v-if="member.github" :href="member.github" target="_blank"><i class="fab fa-github"></i></a>
              </div>
            </div>
            <div class="member-info">
              <p class="member-name">{{ member.name }}</p>
              <p class="member-role">{{ member.role }}</p>
              <p v-if="member.bio" class="member-bio">{{ member.bio }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Technologies Card -->
      <div class="about-card animate__animated animate__fadeInUp animate__delay-3s">
        <div class="about-icon">
          <i class="fas fa-code"></i>
        </div>
        <h3>Technologies Used</h3>
        <p class="card-description">
          Modern technologies powering our system for optimal performance and user experience:
        </p>
        <div class="tech-grid">
          <div v-for="tech in technologies" :key="tech.name" class="tech-item" @mouseover="hoverTech = tech.name" @mouseleave="hoverTech = ''">
            <div class="tech-icon" :class="{'tech-icon-hover': hoverTech === tech.name}">
              <i :class="tech.icon"></i>
            </div>
            <span>{{ tech.name }}</span>
            <div v-if="hoverTech === tech.name" class="tech-tooltip">
              {{ tech.description }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Statistics Card -->
      <div class="about-card animate__animated animate__fadeInUp animate__delay-4s">
        <div class="about-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <h3>System Impact</h3>
        <div class="stats-grid">
          <div class="stat-item" v-for="stat in statistics" :key="stat.label">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
      
      <!-- Contact Card -->
      <div class="about-card animate__animated animate__fadeInUp animate__delay-5s">
        <div class="about-icon">
          <i class="fas fa-envelope"></i>
        </div>
        <h3>Contact & Support</h3>
        <div class="contact-info">
          <div class="contact-item">
            <i class="fas fa-headset"></i>
            <span>Support: support@aitb-hr.com</span>
          </div>
          <div class="contact-item">
            <i class="fas fa-bug"></i>
            <span>Report Issues: bugs@aitb-hr.com</span>
          </div>
          <div class="contact-item">
            <i class="fas fa-lightbulb"></i>
            <span>Suggestions: ideas@aitb-hr.com</span>
          </div>
          <div class="contact-item">
            <i class="fas fa-phone-alt"></i>
            <span>Hotline: +251 123 456 789</span>
          </div>
        </div>
        <div class="social-links">
          <a href="#" class="social-link"><i class="fab fa-facebook"></i></a>
          <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
          <a href="#" class="social-link"><i class="fab fa-linkedin"></i></a>
          <a href="#" class="social-link"><i class="fab fa-youtube"></i></a>
        </div>
      </div>
    </div>
    
    <div class="system-footer animate__animated animate__fadeIn">
      <p>© 2025 AITB Employee Management System. All rights reserved.</p>
      <p class="version-tag">v3.1.0 | Production Environment</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const hoverTech = ref('');

const team = ref([
  {
    name: 'Amanuel Sisay',
    role: 'Lead Developer',
    bio: 'Specialized in system architecture and backend development',
    avatar: '/image/19.jpg',
    linkedin: '#',
    github: '#'
  },
  {
    name: 'Alebel Fetene',
    role: 'UI/UX Designer',
    bio: 'Creating intuitive user interfaces with 5+ years experience',
    avatar: '/image/1919.jpg',
    linkedin: '#',
    github: '#'
  },
  {
    name: 'Guadnew Moges',
    role: 'Backend Developer',
    bio: 'Database expert and API specialist',
    avatar: '/image/2.jpg',
    linkedin: '#',
    github: '#'
  },
  {
    name: 'Ninibel Girma',
    role: 'QA Engineer',
    bio: 'Ensuring system reliability and performance',
    avatar: '/image/5.jpg',
    linkedin: '#',
    github: '#'
  }
]);

const technologies = ref([
  { 
    name: 'Vue.js 3', 
    icon: 'fab fa-vuejs',
    description: 'Progressive JavaScript framework for building user interfaces' 
  },


  { 
    name: 'Tailwind CSS', 
    icon: 'fas fa-palette',
    description: 'Utility-first CSS framework for rapid UI development' 
  },


  { 
    name: 'Node.js', 
    icon: 'fab fa-node-js',
    description: 'JavaScript runtime for scalable server-side applications' 
  },
  { 
    name: 'MongoDB', 
    icon: 'fas fa-leaf',
    description: 'NoSQL database for flexible data storage' 
  },
  { 
    name: 'Express.js', 
    icon: 'fas fa-server',
    description: 'Web application framework for Node.js' 
  },


  { 
    name: 'Vite', 
    icon: 'fas fa-bolt',
    description: 'Next generation frontend tooling for fast development' 
  },


  { 
    name: 'Git', 
    icon: 'fab fa-git-alt',
    description: 'Distributed version control system' 
  },


  { 
    name: 'JWT', 
    icon: 'fas fa-key',
    description: 'Secure authentication tokens for API security' 
  }
]);

const features = ref([
  'Employee Database Management',
  'Attendance & Time Tracking',
  'Leave Management',
  'Training & Development',
  'Document Management',
  'Reporting & Analytics',
  'Role-based Access Control',
  
]);

const statistics = ref([
  { value: '1,250+', label: 'Active Users' },
  { value: '95%', label: 'System Uptime' },
  { value: '78%', label: 'Process Automation' },
  { value: '4.8/5', label: 'User Satisfaction' },
  { value: '12', label: 'Integrated Modules' },
  { value: '24/7', label: 'Support Availability' }
]);
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

.about-page {
  @apply bg-gray-50 rounded-xl shadow-sm p-6 max-w-7xl mx-auto;
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
}

.page-header {
  @apply mb-8 text-center;
  animation: fadeIn 1s ease-in-out;
}

.page-title {
  @apply text-3xl font-bold text-gray-800 mb-2;
  background: linear-gradient(to right, #3b82f6, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
}

.page-title::after {
  content: '';
  @apply block w-20 h-1 mx-auto mt-4;
  background: linear-gradient(to right, #3b82f6, #10b981);
}

.page-subtitle {
  @apply text-lg text-gray-600 max-w-2xl mx-auto;
}

.about-content {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.about-card {
  @apply p-6 border border-gray-100 rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md;
  transform: translateY(0);
}

.about-card:hover {
  transform: translateY(-5px);
}

.about-icon {
  @apply text-4xl mb-4;
  background: linear-gradient(to right, #3b82f6, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  @apply bg-opacity-10;
}

.about-card h3 {
  @apply text-xl font-semibold text-gray-800 mb-4;
  position: relative;
}

.about-card h3::after {
  content: '';
  @apply block w-12 h-1 mt-2;
  background: linear-gradient(to right, #3b82f6, #10b981);
}

.card-description {
  @apply text-gray-600 mb-6;
}

.info-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.info-item {
  @apply py-2 px-3 border border-gray-100 rounded-lg transition-all duration-200 hover:bg-gray-50;
}

.info-label {
  @apply block text-sm text-gray-500;
}

.info-value {
  @apply block text-gray-800 font-medium;
}

/* Team Styles */
.team-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-4;
}

.team-member {
  @apply flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-all duration-200;
  border: 1px solid rgba(229, 231, 235, 0.5);
}

.avatar-container {
  @apply relative;
}

.member-avatar {
  @apply w-14 h-14 rounded-full object-cover border-2 border-white shadow;
}

.avatar-hover {
  @apply absolute inset-0 flex items-center justify-center space-x-2 opacity-0 hover:opacity-100 transition-opacity duration-300;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
}

.avatar-hover a {
  @apply text-white hover:text-emerald-300;
}

.member-info {
  @apply flex-1;
}

.member-name {
  @apply font-medium text-gray-800;
}

.member-role {
  @apply text-sm text-gray-500;
}

.member-bio {
  @apply text-xs text-gray-600 mt-1;
}

/* Technologies Styles */
.tech-grid {
  @apply grid grid-cols-2 sm:grid-cols-3 gap-3;
}

.tech-item {
  @apply flex items-center space-x-2 p-3 bg-gray-50 rounded-lg cursor-pointer relative;
  transition: all 0.3s ease;
}

.tech-item:hover {
  @apply bg-emerald-50;
  transform: translateY(-2px);
}

.tech-icon {
  @apply w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm;
  color: #10b981;
  transition: all 0.3s ease;
}

.tech-icon-hover {
  @apply bg-emerald-500 text-white;
}

.tech-tooltip {
  @apply absolute top-full left-0 mt-2 p-2 bg-gray-800 text-white text-xs rounded z-10;
  width: 200px;
  animation: fadeIn 0.3s ease-in-out;
}

/* Features Styles */
.features-list {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-3;
}

.feature-item {
  @apply flex items-start space-x-2 p-2 rounded hover:bg-gray-50;
}

.feature-icon {
  @apply text-emerald-500 mt-0.5;
}

/* Stats Styles */
.stats-grid {
  @apply grid grid-cols-2 md:grid-cols-3 gap-4;
}

.stat-item {
  @apply p-4 text-center rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-100;
}

.stat-value {
  @apply text-2xl font-bold text-gray-800 mb-1;
  background: linear-gradient(to right, #3b82f6, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  @apply text-xs text-gray-500 uppercase tracking-wider;
}

/* Contact Styles */
.contact-info {
  @apply space-y-3 mb-6;
}

.contact-item {
  @apply flex items-center space-x-3 text-gray-700;
}

.contact-item i {
  @apply text-emerald-500 w-5 text-center;
}

.social-links {
  @apply flex justify-center space-x-4 mt-4;
}

.social-link {
  @apply w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-emerald-500 hover:text-white transition-all duration-300;
}

/* Footer */
.system-footer {
  @apply mt-10 pt-6 border-t border-gray-200 text-center text-sm text-gray-500;
}

.version-tag {
  @apply mt-1 text-xs;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .about-content {
    @apply grid-cols-1;
  }
  
  .info-grid {
    @apply grid-cols-2;
  }
  
  .tech-grid {
    @apply grid-cols-2;
  }
}
</style>