<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import { ref, onMounted, onUnmounted } from 'vue';

const router = useRouter();

// Time for HUD
const currentTime = ref('');
let timer: ReturnType<typeof setInterval>;

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <main class="w-screen h-screen relative overflow-hidden flex items-center justify-center p-8">
    
    <!-- HUD: Top Left (Logo/OS) -->
    <div class="absolute top-8 left-8 z-50">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 bg-primary animate-pulse"></div>
        <span class="font-mono text-sm tracking-widest text-text-muted">CODEHUB OS // v0.1.0</span>
      </div>
    </div>

    <!-- HUD: Top Right (Time/Status) -->
    <div class="absolute top-8 right-8 z-50 text-right">
      <div class="font-mono text-xl text-white font-bold tracking-widest">{{ currentTime }}</div>
      <div class="text-[10px] text-primary uppercase tracking-widest mt-1">System Optimal</div>
    </div>

    <!-- HUD: Bottom Left (Metrics) -->
    <div class="absolute bottom-8 left-8 z-50 hidden md:block">
      <div class="flex gap-6 font-mono text-[10px] text-text-muted uppercase tracking-widest">
        <div>
          <span class="block text-white/20 mb-1">CPU Load</span>
          <span class="text-primary">12%</span>
        </div>
        <div>
          <span class="block text-white/20 mb-1">Memory</span>
          <span class="text-primary">4.2GB</span>
        </div>
        <div>
          <span class="block text-white/20 mb-1">Network</span>
          <span class="text-green-500">Connected</span>
        </div>
      </div>
    </div>

    <!-- HUD: Bottom Right (Credits) -->
    <div class="absolute bottom-8 right-8 z-50 text-right">
      <div class="font-mono text-[10px] text-text-muted uppercase tracking-widest">
        <span class="opacity-50">Designed for Hackers</span>
        <div class="w-full h-[1px] bg-white/10 my-2"></div>
        <span class="text-primary">Not just another SaaS</span>
      </div>
    </div>

    <!-- Background Decor (Texture & Typography) -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <!-- Giant Background Text -->
      <div class="absolute -bottom-[5%] -left-[5%] text-[20vw] font-black text-white/[0.02] leading-none tracking-tighter">
        CODE
      </div>
      <div class="absolute top-[10%] -right-[5%] text-[20vw] font-black text-white/[0.02] leading-none tracking-tighter">
        HUB
      </div>
      
      <!-- Grid Lines -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
      
      <!-- Glowing Orbs -->
      <div class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]"></div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 gap-12 z-10 items-center">
      
      <!-- Text Section -->
      <div class="md:col-span-5 flex flex-col justify-center text-left space-y-8">
        <div class="relative">
          <h1 class="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] mix-blend-difference">
            CODEHUB.
          </h1>
          <!-- Decorative Glitch Line -->
          <div class="absolute -left-4 top-1/2 w-1 h-20 bg-primary/50 hidden md:block"></div>
        </div>
        
        <p class="text-xl text-text-muted max-w-sm font-mono border-l border-white/10 pl-4 ml-1">
          CodeHub Workbench. <br/>
          <span class="text-primary">Not just another SaaS.</span>
        </p>
        
        <div class="space-y-2">
          <p class="text-sm text-text-muted">
            Build stuff. Break stuff. <br/>
            Let the AI fix it.
          </p>
          <!-- Terminal-like blinking cursor -->
          <div class="flex items-center gap-2 text-xs font-mono text-white/30 mt-4">
            <span>$ init_sequence_start...</span>
            <span class="w-2 h-4 bg-primary animate-pulse"></span>
          </div>
        </div>
      </div>

      <!-- Cards Section -->
      <div class="md:col-span-7 grid grid-cols-1 gap-6 relative pl-0 md:pl-12">
        
        <!-- Assistant Card (Refined) -->
        <div 
          @click="navigateTo('/chat/assistant')"
          class="group relative bg-surface-highlight/30 backdrop-blur-sm border border-white/10 hover:border-primary/50 p-6 cursor-pointer transition-all duration-300 hover:bg-surface-highlight/50"
        >
          <!-- Corner Accents -->
          <div class="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-primary transition-colors"></div>
          <div class="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-primary transition-colors"></div>

          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-white/5 rounded group-hover:bg-primary/20 transition-colors">
              <Icon icon="lucide:message-square-code" class="w-8 h-8 text-text-main group-hover:text-primary transition-colors" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono text-white/30 uppercase group-hover:text-primary transition-colors">Standard Access</span>
              <Icon icon="lucide:arrow-up-right" class="w-5 h-5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">智码助手</h2>
          <p class="text-text-muted text-sm leading-relaxed font-mono">
            Your daily code buddy. <br/>
            Debug, Refactor, Whine about bugs.
          </p>
        </div>

        <!-- Agent Card (Highlighted & Powerful) -->
        <div 
          @click="navigateTo('/chat/agent')"
          class="group relative bg-black/40 backdrop-blur-md border border-primary/30 hover:border-primary p-6 cursor-pointer transition-all duration-300 md:ml-12 shadow-[0_0_30px_rgba(223,255,0,0.05)] hover:shadow-[0_0_50px_rgba(223,255,0,0.15)]"
        >
          <!-- Scanline effect overlay -->
          <div class="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] opacity-10 pointer-events-none"></div>

          <div class="absolute -top-3 -right-3 bg-primary text-black text-xs font-bold px-3 py-1 rotate-0 skew-x-[-12deg] shadow-lg">
            SUPER AGENT
          </div>
          
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-primary/10 rounded group-hover:bg-primary/20 transition-colors">
              <Icon icon="lucide:bot" class="w-8 h-8 text-primary" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono text-primary/50 uppercase group-hover:text-primary transition-colors">Full Authority</span>
              <Icon icon="lucide:arrow-up-right" class="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">CodeManus 侦探</h2>
          <p class="text-text-muted text-sm leading-relaxed font-mono">
            The heavy artillery. <br/>
            Full autonomous agent with web access.
          </p>
        </div>

      </div>
    </div>
  </main>
</template>

<style scoped>
/* No extra styles needed, Tailwind handles it all */
</style>
