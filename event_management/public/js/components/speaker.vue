<template>
<div style="padding: 30px; background: #fdfaf6; min-height: calc(100vh - 80px); border-radius: 8px;">
    <div class="row">
        <div class="col-md-8 mx-auto">
            <div class="card shadow-sm p-4" style="background: white; border-radius: 12px; border: 1px solid #f1e9db;">
                <h3 class="mb-4" style="color: #856404; font-weight: 600;">Type Live Message</h3>
                <div class="form-group mb-4">
                    <div class="input-group">
                        <input type="text" v-model="messageInput" class="form-control py-2" 
                               placeholder="Type message and press Enter" @keypress.enter="sendMessage">
                        <button class="btn btn-primary" @click="sendMessage">Send</button>
                    </div>
                </div>
                <div ref="messageContainer"
                     style="margin-top:20px; border:1px solid #f1e9db; background: #fffcf8;
                     padding:20px; height:400px; overflow:auto; border-radius: 8px;">
                    <div v-if="messages.length === 0" class="text-center text-muted" style="margin-top: 150px;">
                        No messages sent yet.
                    </div>
                    <div v-for="(msg, index) in messages" :key="index" 
                         style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #f9f3e8;">
                        <div class="d-flex justify-content-between align-items-baseline mb-1">
                            <b :style="{ color: msg.sender === 'speaker' ? '#0056b3' : '#28a745', textTransform: 'capitalize' }">
                                {{ msg.sender }}
                            </b>
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
    props: ['eventName', 'endTime', 'docname'],
    data() {
        return {
            messageInput: '',
            messages: []
        }
    },
    mounted() {
        frappe.realtime.on('speaker_live_message', (data) => {
            this.messages.push(data);
            this.$nextTick(() => this.scrollToBottom());
        });
        this.checkEventEnd();
        this.interval = setInterval(() => this.checkEventEnd(), 10000);
    },
    beforeUnmount() {
        clearInterval(this.interval);
        frappe.realtime.off('speaker_live_message');
    },
    methods: {
        sendMessage() {
            const msg = this.messageInput.trim();
            if (!msg) return;
            frappe.call({
                method: "event_management.api.send_live_message",
                args: { docname: this.docname, message: msg, user_type: "speaker" },
                callback: () => { this.messageInput = ''; }
            });
        },
        formatTime(t) { return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); },
        scrollToBottom() {
            const c = this.$refs.messageContainer;
            if (c) c.scrollTop = c.scrollHeight;
        },
        checkEventEnd() {
            if (this.endTime && new Date() >= new Date(this.endTime)) {
                sessionStorage.clear();
                frappe.msgprint("Event ended. Logged out.");
                frappe.set_route("event-login");
            }
        }
    }
};
</script>
