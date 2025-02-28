document.addEventListener('DOMContentLoaded', function() {
    const avatarElement = document.getElementById('avatar');
    const refreshButton = document.getElementById('refresh-btn');

    function fetchRandomAvatar() {
        fetch('https://www.wudada.online/Api/SjTx')
            .then(response => response.json())
            .then(data => {
                if (data.code === '200') {
                    avatarElement.src = data.data;
                } else {
                    console.error('请求失败:', data.msg);
                }
            })
            .catch(error => {
                console.error('请求出错:', error);
            });
    }

    // 页面加载时获取第一个头像
    fetchRandomAvatar();

    // 点击按钮时获取新的头像
    refreshButton.addEventListener('click', fetchRandomAvatar);
});
