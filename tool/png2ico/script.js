document.getElementById('file-upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('preview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('convert-btn').addEventListener('click', function() {
    const fileInput = document.getElementById('file-upload');
    const sizeSelect = document.getElementById('size-select');
    const downloadLink = document.getElementById('download-link');

    if (fileInput.files.length === 0) {
        alert('Please select a PNG file first.');
        return;
    }

    const file = fileInput.files[0];
    const size = parseInt(sizeSelect.value);

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);

        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            downloadLink.href = url;
            downloadLink.download = `icon_${size}x${size}.ico`;
            downloadLink.style.display = 'inline-block';
        }, 'image/x-icon');
    };
});
