document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // 切换标签页
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    const radioButtons = document.querySelectorAll('input[name="type"]');
    const inputFields = document.getElementById('input-fields');

    // 监听单选按钮变化
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            const type = radio.value;
            let html = '';

            if (type === 'text') {
                html = '<div class="input-group"><label for="text">文本:</label><input type="text" id="text" name="text" placeholder="输入文本"></div>';
            } else if (type === 'url') {
                html = '<div class="input-group"><label for="url">网址:</label><input type="url" id="url" name="url" placeholder="输入网址"></div>';
            } else if (type === 'email') {
                html = '<div class="input-group"><label for="email">邮件地址:</label><input type="email" id="email" name="email" placeholder="输入邮件地址"></div>';
            } else if (type === 'wifi') {
                html = `
                    <div class="input-group">
                        <label for="ssid">SSID:</label>
                        <input type="text" id="ssid" name="ssid" placeholder="输入WiFi名称">
                    </div>
                    <div class="input-group">
                        <label for="password">密码:</label>
                        <input type="text" id="password" name="password" placeholder="输入WiFi密码">
                    </div>
                    <div class="input-group">
                        <label for="encryption">加密类型:</label>
                        <select id="encryption" name="encryption">
                            <option value="WPA">WPA/WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">无密码</option>
                        </select>
                    </div>
                `;
            }

            inputFields.innerHTML = html;
        });
    });

    const generateForm = document.getElementById('generate-form');
    const qrcodeOutput = document.getElementById('qrcode-output');

    // 生成二维码
    generateForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const type = document.querySelector('input[name="type"]:checked').value;
        let data = '';

        if (type === 'text') {
            data = document.getElementById('text').value;
            const chineseCharCount = (data.match(/[\u4e00-\u9fa5]/g) || []).length;
            if (chineseCharCount > 10) {
                alert('输入汉字过多，请减少内容');
                return;
            }
        } else if (type === 'url') {
            data = document.getElementById('url').value;
        } else if (type === 'email') {
            data = `mailto:${document.getElementById('email').value}`;
        } else if (type === 'wifi') {
            const ssid = document.getElementById('ssid').value;
            const password = document.getElementById('password').value;
            const encryption = document.getElementById('encryption').value;
            data = `WIFI:S:${ssid};T:${encryption};P:${password};;`;
        }

        qrcodeOutput.innerHTML = '';
        try {
            new QRCode(qrcodeOutput, {
                text: data,
                width: 200,
                height: 200,
                version: 10
            });
        } catch (error) {
            alert('无法生成二维码，输入内容过多或无效');
            console.error(error);
        }
    });

    const decodeForm = document.getElementById('decode-form');
    const decodeOutput = document.getElementById('decode-output');
    const decodeArea = document.getElementById('decode');

    // 文件上传解码
    decodeForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const file = document.getElementById('file').files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                decodeImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // 剪切板粘贴解码
    document.addEventListener('paste', function (e) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = function (e) {
                    decodeImage(e.target.result);
                };
                reader.readAsDataURL(blob);
                break;
            }
        }
    });

    // 拖动上传解码
    decodeArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        decodeArea.style.border = '2px dashed #007bff';
    });

    decodeArea.addEventListener('dragleave', function (e) {
        e.preventDefault();
        decodeArea.style.border = '2px dashed #ccc';
    });

    decodeArea.addEventListener('drop', function (e) {
        e.preventDefault();
        decodeArea.style.border = '2px dashed #ccc';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                decodeImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // 解码图片的通用函数
    function decodeImage(imageSrc) {
        const img = new Image();
        img.src = imageSrc;
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const scale = 0.5; // 缩放比例
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                decodeOutput.textContent = `解码结果: ${code.data}`;
            } else {
                decodeOutput.textContent = '无法解码二维码';
            }
        };
    }
});
