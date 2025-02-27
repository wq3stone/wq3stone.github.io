new Vue({
    el: '#app',
    data() {
        return {
            loading: false,
            userInput: '',
            apiKey: 'sk-5bfb6802ebf1435a8f6451954505e5e4',
            messages: [
                {
                    "role": "system",
                    "content": "You are a helpful assistant."
                }
            ],
            currentIndex: 0
        }
    },
    mounted() {
        this.$nextTick(this.scrollToBottom);
    },
    methods: {
        formatContent(content) {
            return marked.parse(content);
        },
        scrollToBottom() {
            const container = document.querySelector('.messages-container');
            container.scrollTop = container.scrollHeight;
        },
        async askChatGPT() {
            if (!this.userInput.trim()) return;
            
            const _this = this;
            _this.loading = true;
            
            try {
                _this.messages.push({
                    "role": "user",
                    "content": this.userInput
                });
                _this.currentIndex += 1;
                _this.userInput = '';
                
                await this.$nextTick();
                this.scrollToBottom();
                
                const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'qwen-plus',
                        messages: this.messages,
                        stream: true
                    })
                });

                if (response.ok) {
                    _this.messages.push({
                        "role": "assistant",
                        "content": ""
                    });
                    _this.currentIndex += 1;

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        
                        const chunk = decoder.decode(value);
                        const lines = chunk.split('\n');
                        
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const dataStr = line.replace('data: ', '');
                                if (dataStr === '[DONE]') continue;
                                
                                try {
                                    const data = JSON.parse(dataStr);
                                    if (data.choices[0].delta.content) {
                                        const text = data.choices[0].delta.content;
                                        _this.messages[_this.currentIndex].content += text;
                                        this.$nextTick(this.scrollToBottom);
                                    }
                                } catch (e) {
                                    console.error('解析错误:', e);
                                }
                            }
                        }
                    }
                } else {
                    this.$message.error('请求失败: ' + response.status);
                }
            } catch (error) {
                this.$message.error('发生错误: ' + error.message);
            } finally {
                _this.loading = false;
                this.$nextTick(this.scrollToBottom);
            }
        }
    }
});
