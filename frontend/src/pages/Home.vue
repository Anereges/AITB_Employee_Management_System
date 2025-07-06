<template>
  <div class="min-h-screen bg-gradient-to-b from-green-50 to-white">
    <!-- Animated Hero Section -->
    <section class="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-24 relative overflow-hidden">
      <!-- Floating bubbles background -->
      <div class="absolute inset-0 overflow-hidden">
        <div v-for="i in 12" :key="i" 
             class="absolute rounded-full bg-white/10"
             :style="{
               width: `${Math.random() * 20 + 10}px`,
               height: `${Math.random() * 20 + 10}px`,
               left: `${Math.random() * 100}%`,
               top: `${Math.random() * 100}%`,
               animation: `float ${Math.random() * 10 + 10}s linear infinite`,
               animationDelay: `${Math.random() * 5}s`
             }"></div>
      </div>

      <div class="container mx-auto px-4 text-center relative z-10">
        <!-- Animated title -->
        <h1 class="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
          <span class="text-shadow-lg">Welcome to </span>
          <span class="text-emerald-200 animate-text-gradient bg-gradient-to-r from-emerald-200 via-white to-emerald-200 bg-clip-text text-transparent">
            AITB Employee
          </span>
          <span class="block mt-2">Management System</span>
        </h1>
        
        <p class="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed">
          Streamline your workforce management with our <span class="font-semibold text-emerald-200">comprehensive solution</span>
        </p>
        
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <router-link
            to="/login"
            class="bg-white text-emerald-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl animate-bounce-in"
          >
            <span class="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
              Login
            </span>
          </router-link>
          <router-link
            to="/register"
            class="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white/20 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl animate-bounce-in-delay"
          >
            <span class="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
              </svg>
              Register Now
            </span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-16">
          <span class="relative inline-block">
            <span class="relative z-10">Key Features</span>
            <span class="absolute bottom-0 left-0 w-full h-3 bg-emerald-100/70 -rotate-1 -z-0"></span>
          </span>
        </h2>
        
        <div class="grid md:grid-cols-3 gap-8">
          <div 
            v-for="(feature, index) in features"
            :key="index"
            class="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 transform hover:-translate-y-2"
            :class="{ 'animate-fade-in-up': true, 'animation-delay-100': index === 1, 'animation-delay-200': index === 2 }"
          >
            <div class="text-emerald-500 mb-6 flex justify-center">
              <div class="p-4 bg-emerald-50 rounded-full">
                <component :is="feature.icon" class="w-8 h-8" />
              </div>
            </div>
            <h3 class="text-xl font-bold mb-4 text-center text-gray-800">{{ feature.title }}</h3>
            <p class="text-gray-600 text-center">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-16 bg-emerald-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-emerald-800">Trusted by Businesses</h2>
        
        <div class="grid md:grid-cols-3 gap-8">
          <div 
            v-for="(testimonial, index) in testimonials"
            :key="index"
            class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold mr-4">
                {{ testimonial.initials }}
              </div>
              <div>
                <h4 class="font-semibold">{{ testimonial.name }}</h4>
                <p class="text-sm text-gray-500">{{ testimonial.position }}</p>
              </div>
            </div>
            <p class="text-gray-700 italic">"{{ testimonial.quote }}"</p>
            <div class="mt-4 flex text-emerald-400">
              <svg v-for="star in 5" :key="star" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="py-20 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-6">Ready to transform your business?</h2>
        <p class="text-xl mb-10 max-w-2xl mx-auto">
          Join hundreds of businesses managing their workforce efficiently
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <router-link
            to="/register"
            class="bg-white text-emerald-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started Free
          </router-link>
          <router-link
            to="/login"
            class="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white/20 transition-all transform hover:scale-105"
          >
            Schedule Demo
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, markRaw } from 'vue'

// Icons
const UserIcon = markRaw({
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>`
})

const ChartIcon = markRaw({
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>`
})

const LockIcon = markRaw({
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>`
})

const features = ref([
  {
    title: 'Employee Management',
    description: 'Easily add, edit, and manage employee records with our intuitive interface.',
    icon: UserIcon
  },
  {
    title: 'Analytics Dashboard',
    description: 'Get insights with real-time analytics and visual reports on your workforce.',
    icon: ChartIcon
  },
  {
    title: 'Secure Access',
    description: 'Role-based access control ensures data security and proper authorization.',
    icon: LockIcon
  }
])

const testimonials = ref([
  {
    name: 'Samrawit Kbede',
    position: 'HR Director, TechCorp',
    initials: 'SJ',
    quote: 'This system reduced our onboarding time by 70% and improved employee satisfaction.'
  },
  {
    name: 'Alebel Fetene',
    position: 'CEO, StartUp Inc',
    initials: 'MC',
    quote: 'The analytics dashboard gives us insights we never had before about our workforce.'
  },
  {
    name: 'Amanuel Sisay',
    position: 'Operations Manager, RetailCo',
    initials: 'DW',
    quote: 'Security was our top concern, and this platform delivered with excellent access controls.'
  }
])
</script>


<style>
/* Animations */
@keyframes float {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
}

@keyframes text-gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce-in {
  0% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes bounce-in-delay {
  0%, 40% { opacity: 0; transform: scale(0.8); }
  70% { opacity: 1; transform: scale(1.05); }
  100% { transform: scale(1); }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

.animate-text-gradient {
  background-size: 200% auto;
  animation: text-gradient 3s linear infinite;
}

.animate-bounce-in {
  animation: bounce-in 0.8s ease-out forwards;
}

.animate-bounce-in-delay {
  animation: bounce-in-delay 1s ease-out forwards;
}

.animation-delay-100 {
  animation-delay: 0.1s;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.text-shadow-lg {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>