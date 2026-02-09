<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <main class="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
    <!-- Decorative Background Elements -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none"></div>

    <div class="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-12 z-10">
      
      <!-- Text Section -->
      <div class="md:col-span-5 flex flex-col justify-center text-left space-y-6">
        <h1 class="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9]">
          CODEHUB.
        </h1>
        <p class="text-xl text-text-muted max-w-sm font-mono">
          CodeHub Workbench. <br/>
          <span class="text-primary">Not just another SaaS.</span>
        </p>
        <div class="h-1 w-20 bg-primary mt-4"></div>
        <p class="text-sm text-text-muted mt-8">
          Build stuff. Break stuff. <br/>
          Let the AI fix it.
        </p>
      </div>

      <!-- Cards Section -->
      <div class="md:col-span-7 grid grid-cols-1 gap-6 relative">
        
        <!-- Assistant Card -->
        <div 
          @click="navigateTo('/chat/assistant')"
          class="group relative bg-surface border border-border hover:border-text-muted p-6 rounded-none cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-surface-highlight rounded-none">
              <Icon icon="lucide:message-square-code" class="w-8 h-8 text-text-main group-hover:text-primary transition-colors" />
            </div>
            <Icon icon="lucide:arrow-up-right" class="w-6 h-6 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">智码助手</h2>
          <p class="text-text-muted text-sm leading-relaxed">
            Your daily code buddy. <br/>
            Debug, Refactor, Whine about bugs.
          </p>
        </div>

        <!-- Agent Card (Highlighted) -->
        <div 
          @click="navigateTo('/chat/agent')"
          class="group relative bg-surface border border-primary/50 hover:border-primary p-6 rounded-none cursor-pointer transition-all duration-300 transform hover:-translate-y-1 md:ml-12 shadow-[0_0_30px_rgba(223,255,0,0.1)] hover:shadow-[0_0_50px_rgba(223,255,0,0.2)]"
        >
          <div class="absolute -top-3 -right-3 bg-primary text-black text-xs font-bold px-2 py-1 rotate-12">
            SUPER AGENT
          </div>
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-primary/10 rounded-none">
              <Icon icon="lucide:bot" class="w-8 h-8 text-primary" />
            </div>
            <Icon icon="lucide:arrow-up-right" class="w-6 h-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">CodeManus 侦探</h2>
          <p class="text-text-muted text-sm leading-relaxed">
            The heavy artillery. <br/>
            Full autonomous agent with web access.
          </p>
        </div>

      </div>
    </div>

    <!-- Footer / Credits -->
    <div class="absolute bottom-8 text-xs text-text-muted font-mono opacity-50">
      <span class="mr-4">v0.1.0-alpha</span>
      <span>DESIGNED FOR HACKERS</span>
    </div>
  </main>
</template>

<style scoped>
/* Optional: specific card hover effects if tailwind isn't enough */
</style>
