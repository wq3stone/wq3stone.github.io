// 获取 DOM 元素
const fileInput = document.getElementById('fileInput');
const qualityInput = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const compressBtn = document.getElementById('compressBtn');
const downloadBtn = document.getElementById('downloadBtn');
const preview = document.getElementById('preview');

// 获取模态框相关元素
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const closeBtn = document.querySelector('.close');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');

// 全局变量
let files = []; // 存储用户上传的文件
let compressedImages = []; // 存储压缩后的图片 Blob
let quality = 0.8; // 默认压缩质量
let currentScale = 1; // 当前图片缩放比例

// 监听文件选择事件
fileInput.addEventListener('change', handleFileSelect);

// 监听压缩质量滑动条变化
qualityInput.addEventListener('input', () => {
    quality = parseFloat(qualityInput.value);
    qualityValue.textContent = quality;
});

// 监听压缩按钮点击事件
compressBtn.addEventListener('click', compressImages);

// 监听下载按钮点击事件
downloadBtn.addEventListener('click', downloadImagesAsZip);

// 处理文件选择
function handleFileSelect(event) {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length > 20) {
        alert('最多只能上传 20 张图片！');
        return;
    }
    files = selectedFiles; // 将文件列表转换为数组
    preview.innerHTML = ''; // 清空预览区域
    files.forEach(file => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file); // 创建图片的临时 URL
        img.style.maxWidth = '150px'; // 限制图片最大宽度
        img.style.maxHeight = '150px'; // 限制图片最大高度
        preview.appendChild(img); // 将图片添加到预览区域
    });
}

// 压缩图片
function compressImages() {
    if (files.length === 0) {
        alert('请先选择图片！');
        return;
    }

    compressedImages = []; // 清空之前的压缩结果
    let processedCount = 0; // 记录已处理的图片数量

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.src = event.target.result; // 读取图片数据
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0); // 将图片绘制到画布上

                // 将画布内容转换为 Blob（压缩后的图片）
                canvas.toBlob(
                    blob => {
                        const size = blob.size; // 获取压缩后图片的大小
                        compressedImages.push({ blob, name: file.name, size }); // 将压缩后的图片存入数组
                        processedCount++;

                        // 如果所有图片都处理完成
                        if (processedCount === files.length) {
                            document.getElementById('downloadBtn').disabled = false; // 启用下载按钮
                            updatePreview(); // 更新预览区域
                        }
                    },
                    'image/jpeg', // 输出格式
                    quality // 压缩质量
                );
            };
        };
        reader.readAsDataURL(file); // 读取文件为 Data URL
    });
}

// 更新预览区域
function updatePreview() {
    preview.innerHTML = ''; // 清空预览区域
    compressedImages.forEach(({ blob, size }) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';

        const img = document.createElement('img');
        img.src = URL.createObjectURL(blob); // 创建压缩后图片的临时 URL
        img.style.maxWidth = '150px'; // 限制图片最大宽度
        img.style.maxHeight = '150px'; // 限制图片最大高度

        const sizeInfo = document.createElement('div');
        sizeInfo.className = 'size-info';
        sizeInfo.textContent = `大小: ${formatSize(size)}`; // 显示图片大小

        previewItem.appendChild(img);
        previewItem.appendChild(sizeInfo);
        preview.appendChild(previewItem);
    });

    setupImageClickListeners(); // 为图片添加点击事件监听
}

// 格式化文件大小
function formatSize(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
}

// 批量下载为 ZIP 文件
function downloadImagesAsZip() {
    if (compressedImages.length === 0) {
        alert('没有可下载的图片！');
        return;
    }

    const zip = new JSZip(); // 创建 ZIP 实例
    const folder = zip.folder('compressed_images'); // 创建一个文件夹

    // 将每张图片添加到 ZIP 文件中
    compressedImages.forEach(({ blob, name }, index) => {
        const fileName = `compressed_${index + 1}_${name.replace(/\.[^/.]+$/, '.jpg')}`; // 生成文件名
        folder.file(fileName, blob); // 将图片添加到文件夹
    });

    // 生成 ZIP 文件并触发下载
    zip.generateAsync({ type: 'blob' }).then(content => {
        saveAs(content, 'compressed_images.zip'); // 使用 FileSaver.js 触发下载
    });
}

// 监听图片点击事件
function setupImageClickListeners() {
    const images = document.querySelectorAll('#preview img');
    images.forEach(img => {
        img.addEventListener('click', () => {
            modal.style.display = 'block'; // 显示模态框
            modalImage.src = img.src; // 设置模态框中的图片
            currentScale = 1; // 重置缩放比例
            modalImage.style.transform = `scale(${currentScale})`; // 应用缩放
        });
    });
}

// 关闭模态框
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none'; // 隐藏模态框
});

// 点击模态框外部关闭
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none'; // 隐藏模态框
    }
});

// 放大图片
zoomInBtn.addEventListener('click', () => {
    currentScale += 0.1; // 增加缩放比例
    modalImage.style.transform = `scale(${currentScale})`; // 应用缩放
});

// 缩小图片
zoomOutBtn.addEventListener('click', () => {
    currentScale -= 0.1; // 减少缩放比例
    if (currentScale < 0.1) currentScale = 0.1; // 最小缩放比例为 0.1
    modalImage.style.transform = `scale(${currentScale})`; // 应用缩放
});
