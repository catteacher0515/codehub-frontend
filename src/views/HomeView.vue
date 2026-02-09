<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import { ref, onMounted, onUnmounted } from 'vue';

const router = useRouter();
const canvasRef = ref<HTMLCanvasElement | null>(null);

// Time for HUD
const currentTime = ref('');
let timer: ReturnType<typeof setInterval>;

// Particles
let animationFrameId: number;

interface Particle {
  x: number;
  y: number;
  speed: number;
  opacity: number;
  size: number;
}

const particles: Particle[] = [];

const initParticles = (width: number, height: number) => {
  particles.length = 0;
  const count = Math.floor((width * height) / 15000); // Density
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 0.2 + Math.random() * 0.5,
      opacity: 0.2 + Math.random() * 0.5, // Increased base opacity
      size: 1.5 + Math.random() * 2.5 // Increased size (1.5-4px)
    });
  }
};

const drawParticles = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Update and draw
  ctx.fillStyle = '#DFFF00'; // Primary color

  particles.forEach(p => {
    // Move up faster
    p.y -= p.speed * 1.5; // 1.5x speed
    
    // Reset if out of screen
    if (p.y < 0) {
      p.y = canvas.height;
      p.x = Math.random() * canvas.width;
    }

    ctx.beginPath();
    ctx.globalAlpha = p.opacity; // Use direct opacity, removed 0.3 multiplier
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  animationFrameId = requestAnimationFrame(drawParticles);
};

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
};

const handleResize = () => {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth;
    canvasRef.value.height = window.innerHeight;
    initParticles(window.innerWidth, window.innerHeight);
  }
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
  
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth;
    canvasRef.value.height = window.innerHeight;
    initParticles(window.innerWidth, window.innerHeight);
    drawParticles();
  }

  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  clearInterval(timer);
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', handleResize);
});

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <main class="w-screen h-screen relative overflow-hidden flex items-center justify-center p-8 bg-background">
    
    <!-- Particle Canvas Layer (Z-0) -->
    <canvas ref="canvasRef" class="absolute inset-0 pointer-events-none z-0"></canvas>

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

    <!-- Background Decor (Texture & Typography) - Further De-emphasized -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <!-- Giant Background Text (Solid dark gray, no mix-blend, lower opacity) -->
      <div class="absolute -bottom-[5%] -left-[5%] text-[20vw] font-black text-[#111] opacity-50 leading-none tracking-tighter blur-[2px]">
        CODE
      </div>
      <div class="absolute top-[10%] -right-[5%] text-[20vw] font-black text-[#111] opacity-50 leading-none tracking-tighter blur-[2px]">
        HUB
      </div>
      
      <!-- Grid Lines (Subtle) -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-50"></div>
      
      <!-- Glowing Orbs -->
      <div class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]"></div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 z-10 items-center">
      
      <!-- Text Section -->
      <div class="md:col-span-5 flex flex-col justify-center text-left space-y-8 pl-8 md:pl-0">
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

      <!-- Cards Section (Staggered Layout) -->
      <div class="md:col-span-7 relative h-[480px] flex items-center justify-center">
        
        <!-- Assistant Card (Solid Background + Left Position) -->
        <div 
          @click="navigateTo('/chat/assistant')"
          class="absolute top-4 left-0 md:left-4 w-full md:w-[380px] z-20 group bg-[#0A0A0A] border border-white/30 p-6 cursor-pointer transition-all duration-300 hover:border-primary hover:-translate-y-2 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(223,255,0,0.1)]"
        >
          <!-- Corner Accents (Disconnected Border Effect) -->
          <div class="absolute -top-[1px] -left-[1px] w-4 h-4 border-t border-l border-white/40 group-hover:border-primary transition-colors"></div>
          <div class="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b border-r border-white/40 group-hover:border-primary transition-colors"></div>

          <div class="flex items-start justify-between mb-8">
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
          
          <!-- Connector Line to Next Card -->
          <div class="absolute -bottom-6 left-1/2 w-[2px] h-6 bg-white/10 hidden md:block"></div>
        </div>

        <!-- Agent Card (Offset + Right Position) -->
        <div 
          @click="navigateTo('/chat/agent')"
          class="absolute bottom-4 right-0 md:right-4 w-full md:w-[400px] z-30 group bg-black border border-primary/30 p-8 cursor-pointer transition-all duration-300 hover:border-primary hover:-translate-y-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <!-- Scanline effect overlay -->
          <div class="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] opacity-20 pointer-events-none"></div>

          <div class="absolute -top-4 -right-4 bg-primary text-black text-xs font-bold px-4 py-1 rotate-0 skew-x-[-12deg] shadow-lg border border-black">
            SUPER AGENT
          </div>
          
          <div class="flex items-start justify-between mb-8">
            <div class="p-3 bg-primary/10 rounded group-hover:bg-primary/20 transition-colors">
              <Icon icon="lucide:bot" class="w-10 h-10 text-primary" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono text-primary/50 uppercase group-hover:text-primary transition-colors">Full Authority</span>
              <Icon icon="lucide:arrow-up-right" class="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <h2 class="text-3xl font-bold text-white mb-3">CodeManus 侦探</h2>
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
/* Ensure canvas is behind everything but handles resize well */
canvas {
  display: block;
}
</style>
