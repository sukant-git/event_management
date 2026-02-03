<template>
<div style="padding: 20px; background: #f5fdf5; min-height: calc(100vh - 80px); border-radius: 8px;">
    <div class="row">
        <div class="col-md-8 mx-auto">
            <div class="card shadow-sm p-4" style="background: white; border-radius: 12px; border: 1px solid #e1eedd;">
                <h3 class="mb-4" style="color: #2d5a27; font-weight: 600;">Live Messages from Speaker</h3>
                <div ref="messageContainer" style="
                    border: 1px solid #e1eedd; 
                    padding: 20px; 
                    height: 500px; 
                    overflow: auto;
                    background: #fbfdfb; 
                    border-radius: 8px;
                ">
                    <div v-if="messages.length === 0" class="text-center text-muted" style="margin-top: 200px;">
                        Waiting for messages...
                    </div>
                    <div v-for="(msg, index) in messages" :key="index" 
                         style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #f1f8f0;">
                        <div class="d-flex justify-content-between align-items-baseline mb-1">
                            <strong :style="{ color: msg.sender === 'speaker' ? '#0056b3' : '#28a745', textTransform: 'capitalize' }">
                                {{ msg.sender || 'Speaker' }}
                            </strong>
                            <small style="color:#999; font-size: 0.75em;">
                                {{ formatTime(msg.timestamp) }}
                            </small>
                        </div>
                        <div style="color: #444; word-wrap: break-word;">
                            {{ msg.message }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
    props: ['eventName'],
    data() { 
        return { 
            messages: [] 
        } 
    },
    mounted() {
        frappe.realtime.on('speaker_live_message', (data) => {
            if (data) {
                this.messages.push(data);
                this.$nextTick(() => this.scrollToBottom());
            }
        });
    },
    beforeUnmount() { frappe.realtime.off('speaker_live_message'); },
    methods: {
        formatTime(t) { return t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ""; },
        scrollToBottom() {
            const c = this.$refs.messageContainer;
            if (c) c.scrollTop = c.scrollHeight;
        }
    }
};
</script>

