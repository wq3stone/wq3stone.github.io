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
    methods: {
        formatContent(content) {
            return marked.parse(content);
        },
        scrollToBottom() {
            var scrollTarget = document.getElementById("response");
            scrollTarget.scrollTop=scrollTarget.scrollHeight;
        },
        async askChatGPT() {
            var _this = this
            _this.loading = true
            _this.messages.push(
                {
                "role": "user",
                "content": this.userInput
            })
            _this.currentIndex += 1
            _this.userInput = ''
            const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'qwen-plus',  //deepseek-r1
                    messages: this.messages,
                    // max_tokens: 1000,
                    stream: true
                })
            });
            if (response.ok) {
                _this.scrollToBottom()
                _this.loading = false
                const reader = response.body.getReader();
                const stream = new ReadableStream({
                    async start(controller) {
                        function fetchData() {
                            reader.read().then(({done, value}) => {
                                if (done) {
                                    controller.close();
                                    return;
                                }
                                const chunkText = new TextDecoder().decode(value);
                                chunkText.split('\n').forEach(line => {
                                    if (line) {
                                        if (line === 'data: [DONE]') {
                                            return
                                        }
                                        line = line.replaceAll('data: ', '');
                                        const data = JSON.parse(line);
                                        if (data.choices[0].finish_reason && data.choices[0].finish_reason === 'stop') {
                                            return;
                                        }
                                        
                                        if (data.choices[0].delta.reasoning_content) {
                                            const text = data.choices[0].delta.reasoning_content;
                                            _this.messages[_this.currentIndex].content += text;
                                            _this.scrollToBottom()
                                        }
                                        
                                        if (data.choices[0].delta.content) {
                                            const text = data.choices[0].delta.content;
                                            _this.messages[_this.currentIndex].content += text;
                    
                                            _this.scrollToBottom()
                                        }

                                        

                                
                                    }
                                });
                                fetchData();
                            });
                        }
                        _this.messages.push({
                            "role": "assistant",
                            "content": ""
                        })
                        _this.currentIndex += 1
                        fetchData();
                    }
                });
                await new Response(stream).text();
            } else {
                this.$message.error('发生错误')
            }
        }
    }
});
