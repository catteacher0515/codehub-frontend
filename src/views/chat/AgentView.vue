<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import { renderMarkdown } from '@/utils/markdown';

const router = useRouter();
const input = ref('');
const events = ref<any[]>([]);
const isStreaming = ref(false);

const sendMessage = () => {
  if (!input.value.trim() || isStreaming.value) return;

  const userMsg = input.value;
  // Add user message to the feed
  events.value.push({ type: 'USER', data: { content: userMsg } });
  input.value = '';
  isStreaming.value = true;

  const eventSource = new EventSource(`/api/agent/chat?prompt=${encodeURIComponent(userMsg)}`);

  // Helper to push event
  const pushEvent = (type: string, data: any) => {
    events.value.push({ type, data });
    // Auto scroll
    nextTick(() => {
      const container = document.querySelector('.chat-container');
      if (container) container.scrollTop = container.scrollHeight;
    });
  };

  eventSource.addEventListener('THINKING', (e) => {
    const data = JSON.parse(e.data);
    pushEvent('THINKING', data);
  });

  eventSource.addEventListener('ACTION', (e) => {
    const data = JSON.parse(e.data);
    pushEvent('ACTION', data);
  });

  eventSource.addEventListener('RESULT', (e) => {
    const data = JSON.parse(e.data);
    pushEvent('RESULT', data);
  });

  eventSource.addEventListener('ANSWER', (e) => {
    const data = JSON.parse(e.data);
    pushEvent('ANSWER', data);
  });

  eventSource.addEventListener('ERROR', (e) => {
    const data = JSON.parse(e.data);
    pushEvent('ERROR', data);
    eventSource.close();
    isStreaming.value = false;
  });

  eventSource.onerror = (err) => {
    console.error('SSE Error:', err);
    eventSource.close();
    isStreaming.value = false;
  };
};

const goBack = () => router.push('/');
</script>

<template>
  <div class="h-screen flex flex-col bg-background text-text-main">
    <!-- Header -->
    <header class="h-16 border-b border-border flex items-center px-6 justify-between bg-surface/50 backdrop-blur">
      <div class="flex items-center gap-4">
        <button @click="goBack" class="hover:text-primary transition-colors">
          <Icon icon="lucide:arrow-left" class="w-6 h-6" />
        </button>
        <h1 class="font-bold text-lg text-primary">CodeManus 侦探</h1>
      </div>
      <div class="text-xs text-text-muted font-mono">Autonomous Agent • Custom Event Stream</div>
    </header>

    <!-- Chat Area -->
    <div class="chat-container flex-1 overflow-y-auto p-6">
      <div class="max-w-4xl mx-auto space-y-6 h-full flex flex-col">
        <div v-if="events.length === 0" class="flex-1 flex flex-col items-center justify-center text-text-muted opacity-50">
          <Icon icon="lucide:bot" class="w-16 h-16 mb-4 text-primary" />
          <p>I can search the web and run tools.</p>
        </div>

        <div v-for="(evt, idx) in events" :key="idx" class="animate-fade-in">
          
          <!-- User Message -->
          <div v-if="evt.type === 'USER'" class="flex justify-end mb-8">
            <div class="bg-primary text-black px-4 py-3 rounded-lg max-w-[80%] font-mono text-sm shadow-[0_0_15px_rgba(223,255,0,0.2)]">
              {{ evt.data.content }}
            </div>
          </div>

          <!-- AI Thinking -->
          <div v-if="evt.type === 'THINKING'" class="flex gap-4 mb-4 opacity-70">
            <div class="w-8 h-8 flex items-center justify-center">
              <Icon icon="lucide:brain-circuit" class="w-5 h-5 text-text-muted" />
            </div>
            <div class="flex-1 bg-surface border border-border p-3 rounded text-xs font-mono text-text-muted">
              <span class="text-xs uppercase tracking-widest mb-1 block">Thinking</span>
              {{ evt.data.thought || evt.data }}
            </div>
          </div>

          <!-- AI Action -->
          <div v-if="evt.type === 'ACTION'" class="flex gap-4 mb-4">
            <div class="w-8 h-8 flex items-center justify-center">
              <Icon icon="lucide:hammer" class="w-5 h-5 text-orange-400" />
            </div>
            <div class="flex-1 border-l-2 border-orange-400 pl-4 py-1">
              <div class="text-orange-400 text-xs font-bold uppercase mb-1">Executing Tool</div>
              <div class="font-mono text-sm">{{ evt.data.tool }}</div>
            </div>
          </div>

          <!-- AI Result -->
          <div v-if="evt.type === 'RESULT'" class="flex gap-4 mb-4">
            <div class="w-8 h-8 flex items-center justify-center">
              <Icon icon="lucide:check-circle" class="w-5 h-5 text-green-400" />
            </div>
            <div class="flex-1 bg-black/50 p-3 rounded border border-green-900/50 font-mono text-xs text-green-300 overflow-x-auto">
              {{ evt.data.output || evt.data }}
            </div>
          </div>

          <!-- AI Answer -->
          <div v-if="evt.type === 'ANSWER'" class="flex gap-4 mb-8">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10 border border-primary/20">
              
              <!-- Dynamic Icon for Agent Answer -->
              <div v-if="isStreaming && idx === events.length - 1" class="relative w-5 h-5 flex items-center justify-center">
                 <Icon icon="lucide:loader-2" class="w-5 h-5 text-primary animate-spin" />
                 <div class="absolute inset-0 bg-primary/30 blur-[4px] animate-pulse rounded-full"></div>
              </div>
              <Icon v-else icon="lucide:sparkles" class="w-5 h-5 text-primary" />
              
            </div>
            <div class="max-w-[80%] text-text-main prose">
              <div v-html="renderMarkdown(evt.data.content || evt.data)"></div>
            </div>
          </div>

          <!-- Error -->
          <div v-if="evt.type === 'ERROR'" class="flex gap-4 mb-4">
            <div class="w-8 h-8 flex items-center justify-center">
              <Icon icon="lucide:alert-triangle" class="w-5 h-5 text-red-500" />
            </div>
            <div class="text-red-500 border border-red-900/50 bg-red-900/10 p-4 rounded w-full">
              {{ evt.data.message || evt.data }}
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="p-4 border-t border-border bg-surface/50">
      <div class="max-w-4xl mx-auto flex gap-4">
        <input 
          v-model="input" 
          @keyup.enter="sendMessage"
          type="text" 
          placeholder="Assign a task to CodeManus..." 
          class="flex-1 bg-surface-highlight border border-border rounded-none px-4 py-3 focus:outline-none focus:border-primary transition-colors font-mono text-sm"
          :disabled="isStreaming"
        />
        <button 
          @click="sendMessage"
          :disabled="isStreaming || !input"
          class="bg-primary text-black px-6 font-bold disabled:opacity-50 hover:bg-white transition-colors">
          DISPATCH
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Force Tight Typography via Deep Selector */
:deep(.prose p) {
  margin-bottom: 0.5em !important;
}
:deep(.prose p:last-child) {
  margin-bottom: 0 !important;
}
:deep(.prose ul), :deep(.prose ol) {
  margin-bottom: 0.5em !important;
  padding-left: 1.2em !important;
}
:deep(.prose li) {
  margin-bottom: 0 !important;
}
/* Fix loose list spacing: remove margin from paragraphs inside list items */
:deep(.prose li p) {
  margin: 0 !important;
}
:deep(.prose h1), :deep(.prose h2), :deep(.prose h3) {
  margin-top: 1em !important;
  margin-bottom: 0.5em !important;
}
:deep(.prose h1:first-child), :deep(.prose h2:first-child), :deep(.prose h3:first-child) {
  margin-top: 0 !important;
}
:deep(.prose pre) {
  margin-top: 0.5em !important;
  margin-bottom: 0.5em !important;
}
</style>
