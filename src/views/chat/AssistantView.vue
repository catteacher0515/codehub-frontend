<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import { renderMarkdown } from '@/utils/markdown';

const router = useRouter();
const input = ref('');
const messages = ref<{role: 'user'|'assistant', content: string}[]>([]);
const isStreaming = ref(false);

// Helper to check if a message should be rendered as Markdown
const isMarkdown = (role: string) => role === 'assistant';

const sendMessage = () => {
  if (!input.value.trim() || isStreaming.value) return;

  const userMsg = input.value;
  messages.value.push({ role: 'user', content: userMsg });
  input.value = '';
  isStreaming.value = true;
  
  // Create a placeholder for assistant response
  messages.value.push({ role: 'assistant', content: '' });
  const currentMsgIndex = messages.value.length - 1;

  // SSE Connection
  const eventSource = new EventSource(`/api/assistant/chat?prompt=${encodeURIComponent(userMsg)}`);

  eventSource.onmessage = (event) => {
    // Append text chunk
    messages.value[currentMsgIndex].content += event.data;
  };

  eventSource.onerror = (err) => {
    // Only log actual errors, not normal close events
    if (eventSource.readyState !== EventSource.CLOSED) {
      console.error('SSE Error:', err);
    }
    eventSource.close();
    isStreaming.value = false;
  };

  // If the backend sends a specific event to close, or we just rely on connection close
  // Usually SSE stays open, but for one-off chat it might close. 
  // We'll assume the user closes or backend closes.
  // For this demo, let's just listen.
};

const fillPrompt = (text: string) => {
  input.value = text;
  // Optional: Auto send? Or just focus? Let's just focus for now.
  const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
  if (inputEl) inputEl.focus();
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
        <h1 class="font-bold text-lg">智码助手</h1>
      </div>
      <div class="text-xs text-text-muted font-mono">Standard SSE Stream</div>
    </header>

    <!-- Chat Area -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-4xl mx-auto space-y-6 h-full flex flex-col">
        
        <!-- Welcome / Empty State -->
        <div v-if="messages.length === 0" class="flex-1 flex flex-col items-center justify-center space-y-12 animate-fade-in">
          
          <!-- Greeting -->
          <div class="text-center space-y-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-highlight border border-white/10 text-xs font-mono text-primary mb-4">
              <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              SYSTEM ONLINE
            </div>
            <h2 class="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
              Where should we start?
            </h2>
            <p class="text-text-muted max-w-md mx-auto">
              Ready to debug, refactor, or build something new.
            </p>
          </div>

          <!-- Quick Prompts Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            <button 
              @click="fillPrompt('Explain this code segment...')"
              class="group text-left p-4 rounded-lg border border-white/10 bg-surface hover:bg-surface-highlight hover:border-primary/50 transition-all duration-200"
            >
              <div class="flex items-center gap-3 mb-2">
                <div class="p-2 rounded bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                  <Icon icon="lucide:book-open" class="w-4 h-4" />
                </div>
                <span class="font-bold text-sm text-white">Explain Code</span>
              </div>
              <p class="text-xs text-text-muted">Analyze logic and structure.</p>
            </button>

            <button 
              @click="fillPrompt('Refactor this function to be more efficient...')"
              class="group text-left p-4 rounded-lg border border-white/10 bg-surface hover:bg-surface-highlight hover:border-primary/50 transition-all duration-200"
            >
              <div class="flex items-center gap-3 mb-2">
                <div class="p-2 rounded bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Icon icon="lucide:hammer" class="w-4 h-4" />
                </div>
                <span class="font-bold text-sm text-white">Refactor</span>
              </div>
              <p class="text-xs text-text-muted">Improve performance & style.</p>
            </button>

            <button 
              @click="fillPrompt('Find potential bugs in this snippet...')"
              class="group text-left p-4 rounded-lg border border-white/10 bg-surface hover:bg-surface-highlight hover:border-primary/50 transition-all duration-200"
            >
              <div class="flex items-center gap-3 mb-2">
                <div class="p-2 rounded bg-red-500/10 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <Icon icon="lucide:bug" class="w-4 h-4" />
                </div>
                <span class="font-bold text-sm text-white">Find Bugs</span>
              </div>
              <p class="text-xs text-text-muted">Scan for vulnerabilities.</p>
            </button>

            <button 
              @click="fillPrompt('Generate unit tests for...')"
              class="group text-left p-4 rounded-lg border border-white/10 bg-surface hover:bg-surface-highlight hover:border-primary/50 transition-all duration-200"
            >
              <div class="flex items-center gap-3 mb-2">
                <div class="p-2 rounded bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Icon icon="lucide:test-tube-2" class="w-4 h-4" />
                </div>
                <span class="font-bold text-sm text-white">Unit Tests</span>
              </div>
              <p class="text-xs text-text-muted">Ensure code reliability.</p>
            </button>
          </div>

        </div>
        
        <div v-for="(msg, idx) in messages" :key="idx" class="flex gap-4" :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" 
            :class="msg.role === 'user' ? 'bg-primary text-black' : 'bg-surface-highlight border border-white/10'">
            
            <!-- User Icon -->
            <Icon v-if="msg.role === 'user'" icon="lucide:user" class="w-5 h-5" />
            
            <!-- AI Icon Logic -->
            <template v-else>
              <!-- Streaming State (Only for the last message if streaming) -->
              <div v-if="isStreaming && idx === messages.length - 1" class="relative w-5 h-5 flex items-center justify-center">
                <Icon icon="lucide:loader-2" class="w-5 h-5 text-primary animate-spin" />
                <div class="absolute inset-0 bg-primary/20 blur-[4px] animate-pulse rounded-full"></div>
              </div>
              <!-- Static State -->
              <Icon v-else icon="lucide:bot" class="w-5 h-5 text-text-muted" />
            </template>

          </div>
          <div class="max-w-[80%] p-4 rounded-lg whitespace-pre-wrap font-mono text-sm"
            :class="msg.role === 'user' ? 'bg-surface-highlight border border-border leading-relaxed' : 'bg-transparent prose'">
            
            <div v-if="isMarkdown(msg.role)" v-html="renderMarkdown(msg.content)"></div>
            <template v-else>{{ msg.content }}</template>
            
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
          placeholder="Type a message..." 
          class="flex-1 bg-surface-highlight border border-border rounded-none px-4 py-3 focus:outline-none focus:border-primary transition-colors font-mono text-sm"
          :disabled="isStreaming"
        />
        <button 
          @click="sendMessage"
          :disabled="isStreaming || !input"
          class="bg-primary text-black px-6 font-bold disabled:opacity-50 hover:bg-white transition-colors">
          SEND
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
  opacity: 0;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); } 
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
