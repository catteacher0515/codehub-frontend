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
  
  // Push User Message
  events.value.push({ type: 'USER', data: { content: userMsg } });
  
  // Create a new Thought Group
  events.value.push({ 
    type: 'THOUGHT_GROUP', 
    data: { 
      items: [], 
      isExpanded: false, // Default collapsed
      isThinking: true   // Still receiving thought events
    } 
  });
  
  input.value = '';
  isStreaming.value = true;

  const eventSource = new EventSource(`/api/agent/chat?prompt=${encodeURIComponent(userMsg)}`);

  // Helper to push top-level event (ANSWER, ERROR, USER, etc.)
  const pushTopLevelEvent = (type: string, data: any) => {
    events.value.push({ type, data });
    // Auto scroll
    nextTick(() => {
      const container = document.querySelector('.chat-container');
      if (container) container.scrollTop = container.scrollHeight;
    });
  };

  // Helper to push to the current thought group
  const pushToThoughtGroup = (type: string, data: any) => {
    const lastGroup = events.value[events.value.length - 1];
    if (lastGroup && lastGroup.type === 'THOUGHT_GROUP') {
      lastGroup.data.items.push({ type, data });
    }
    // Auto scroll
    nextTick(() => {
      const container = document.querySelector('.chat-container');
      if (container) container.scrollTop = container.scrollHeight;
    });
  };

  eventSource.addEventListener('THINKING', (e) => {
    const data = JSON.parse(e.data);
    pushToThoughtGroup('THINKING', data);
  });

  eventSource.addEventListener('ACTION', (e) => {
    const rawData = JSON.parse(e.data);
    
    // Adapt backend AgentEvent format (meta -> tool, content -> arguments) to frontend format
    const data = {
      ...rawData,
      tool: rawData.tool || rawData.meta,
      arguments: rawData.arguments || rawData.content
    };
    
    // Check for terminate tool
    let answerContent = null;
    if (data.tool && data.tool.toLowerCase() === 'terminate') {
      // 1. Mark thinking as done immediately
      const lastGroup = events.value[events.value.length - 1];
      if (lastGroup && lastGroup.type === 'THOUGHT_GROUP') {
        lastGroup.data.isThinking = false;
      }

      // 2. Try to extract answer
      try {
        const args = typeof data.arguments === 'string' ? JSON.parse(data.arguments) : data.arguments;
        
        if (typeof args === 'string') {
          answerContent = args;
        } else if (args && typeof args === 'object') {
          answerContent = args.reason || args.answer || args.content || args.result || args.message;
        }
      } catch (err) {
        // If parsing fails, treat arguments as raw content string
        if (typeof data.arguments === 'string') {
          answerContent = data.arguments;
        }
      }

      // 3. If we still don't have structured content but have arguments, use raw arguments
      if (!answerContent && data.arguments) {
         answerContent = typeof data.arguments === 'object' ? JSON.stringify(data.arguments) : String(data.arguments);
      }
    }

    // Always log the action to the thought group first
    pushToThoughtGroup('ACTION', data);

    // If we found an answer content, push it as a top-level event
    if (answerContent) {
      pushTopLevelEvent('ANSWER', { content: answerContent });
      
      // Close stream as we have the final answer
      eventSource.close();
      isStreaming.value = false;
    }
  });

  eventSource.addEventListener('RESULT', (e) => {
    const data = JSON.parse(e.data);
    pushToThoughtGroup('RESULT', data);
  });

  // Fallback for direct answer (if any)
  eventSource.addEventListener('ANSWER', (e) => {
    const data = JSON.parse(e.data);
    // Finish thinking
    const lastGroup = events.value[events.value.length - 1];
    if (lastGroup && lastGroup.type === 'THOUGHT_GROUP') {
      lastGroup.data.isThinking = false;
    }
    pushTopLevelEvent('ANSWER', data);
  });

  eventSource.addEventListener('ERROR', (e) => {
    let data = e.data;
    try { data = JSON.parse(e.data); } catch (_) {}
    
    // Finish thinking with error state
    const lastGroup = events.value[events.value.length - 1];
    if (lastGroup && lastGroup.type === 'THOUGHT_GROUP') {
      lastGroup.data.isThinking = false;
      lastGroup.data.hasError = true; // Add error flag
    }
    
    pushTopLevelEvent('ERROR', data);
    eventSource.close();
    isStreaming.value = false;
  });

  eventSource.onerror = (err) => {
    if (eventSource.readyState !== EventSource.CLOSED) {
      console.error('SSE Error:', err);
    }
    eventSource.close();
    isStreaming.value = false;
    
    // Mark thinking as done with error if connection fails
    const lastGroup = events.value[events.value.length - 1];
    if (lastGroup && lastGroup.type === 'THOUGHT_GROUP') {
      if (lastGroup.data.isThinking) {
         lastGroup.data.hasError = true;
         pushTopLevelEvent('ERROR', 'Connection lost or timed out. Please try again.');
      }
      lastGroup.data.isThinking = false;
    }
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

          <!-- Thought Group (Accordion) -->
          <div v-if="evt.type === 'THOUGHT_GROUP'" class="mb-8">
            <div class="border border-border rounded-lg overflow-hidden bg-surface/30">
              <!-- Header / Toggle -->
              <button 
                @click="evt.data.isExpanded = !evt.data.isExpanded"
                class="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-surface-highlight transition-colors text-xs font-mono uppercase tracking-wider"
                :class="evt.data.hasError ? 'text-red-400' : 'text-text-muted'"
              >
                <div class="flex items-center gap-2">
                  <Icon 
                    :icon="evt.data.hasError ? 'lucide:alert-circle' : 'lucide:brain-circuit'" 
                    class="w-4 h-4" 
                    :class="evt.data.isThinking ? 'animate-pulse text-primary' : (evt.data.hasError ? 'text-red-500' : '')" 
                  />
                  <span>{{ evt.data.isThinking ? 'Thinking Process...' : (evt.data.hasError ? 'Process Failed' : 'Thinking Process') }}</span>
                  <span 
                    class="px-1.5 py-0.5 rounded text-[10px] border"
                    :class="evt.data.hasError ? 'bg-red-900/20 text-red-400 border-red-900/30' : 'bg-surface-highlight text-text-muted border-border'"
                  >
                    {{ evt.data.items.length }} Steps
                  </span>
                </div>
                <Icon :icon="evt.data.isExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="w-4 h-4" />
              </button>

              <!-- Expanded Content -->
              <div v-if="evt.data.isExpanded" class="p-4 space-y-4 border-t border-border bg-[#0d0d0d]">
                <div v-for="(item, i) in evt.data.items" :key="i" class="animate-fade-in">
                  
                  <!-- Thinking Step -->
                  <div v-if="item.type === 'THINKING'" class="flex gap-3">
                    <div class="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                      <div class="w-1.5 h-1.5 rounded-full bg-text-muted"></div>
                    </div>
                    <div class="text-xs text-text-muted font-mono leading-relaxed">
                      {{ item.data.thought || item.data.content || item.data }}
                    </div>
                  </div>

                  <!-- Action Step -->
                  <div v-if="item.type === 'ACTION'" class="flex gap-3">
                    <div class="w-6 h-6 flex items-center justify-center shrink-0">
                      <Icon icon="lucide:hammer" class="w-3.5 h-3.5 text-orange-400" />
                    </div>
                    <div class="flex-1 bg-orange-900/10 border border-orange-900/30 rounded px-3 py-2">
                      <div class="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase mb-1">
                        <span>Tool Call</span>
                        <span class="text-white/30">•</span>
                        <span class="font-mono text-orange-300">{{ item.data.tool }}</span>
                      </div>
                      <div class="font-mono text-xs text-text-muted truncate opacity-70">
                        args: {{ typeof item.data.arguments === 'object' ? JSON.stringify(item.data.arguments) : item.data.arguments }}
                      </div>
                    </div>
                  </div>

                  <!-- Result Step -->
                  <div v-if="item.type === 'RESULT'" class="flex gap-3">
                    <div class="w-6 h-6 flex items-center justify-center shrink-0">
                      <Icon icon="lucide:check" class="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <div class="flex-1 bg-green-900/5 border border-green-900/20 rounded px-3 py-2">
                      <div class="text-green-500 text-[10px] font-bold uppercase mb-1">Result</div>
                      <div class="font-mono text-xs text-text-muted/80 overflow-x-auto whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {{ item.data.content || item.data.output || item.data }}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <!-- AI Answer (Final) -->
          <div v-if="evt.type === 'ANSWER'" class="flex gap-4 mb-8 animate-fade-in">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10 border border-primary/20">
              <Icon icon="lucide:sparkles" class="w-5 h-5 text-primary" />
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
