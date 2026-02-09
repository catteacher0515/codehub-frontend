<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const input = ref('');
const messages = ref<{role: 'user'|'assistant', content: string}[]>([]);
const isStreaming = ref(false);

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
    console.error('SSE Error:', err);
    eventSource.close();
    isStreaming.value = false;
  };

  // If the backend sends a specific event to close, or we just rely on connection close
  // Usually SSE stays open, but for one-off chat it might close. 
  // We'll assume the user closes or backend closes.
  // For this demo, let's just listen.
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
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
        <Icon icon="lucide:message-square-code" class="w-16 h-16 mb-4" />
        <p>Ask me anything about code.</p>
      </div>
      
      <div v-for="(msg, idx) in messages" :key="idx" class="flex gap-4" :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
        <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" 
          :class="msg.role === 'user' ? 'bg-primary text-black' : 'bg-surface-highlight'">
          <Icon :icon="msg.role === 'user' ? 'lucide:user' : 'lucide:bot'" class="w-5 h-5" />
        </div>
        <div class="max-w-[80%] p-4 rounded-lg whitespace-pre-wrap leading-relaxed font-mono text-sm"
          :class="msg.role === 'user' ? 'bg-surface-highlight border border-border' : 'bg-transparent'">
          {{ msg.content }}
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
