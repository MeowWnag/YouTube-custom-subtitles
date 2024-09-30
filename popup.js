// 為上傳按鈕添加點擊事件監聽器
document.getElementById('uploadBtn').addEventListener('click', function() {
    // 獲取文件輸入元素
    const fileInput = document.getElementById('subtitleFile');
    // 獲取選擇的文件
    const file = fileInput.files[0];
    if (file) {
      // 創建FileReader對象
      const reader = new FileReader();
      // 設置文件讀取完成後的回調函數
      reader.onload = function(e) {
        // 獲取文件內容
        const content = e.target.result;
        // 將字幕內容保存到Chrome的本地存儲中
        chrome.storage.local.set({subtitles: content}, function() {
          console.log('字幕已保存到本地存儲');
          console.log('保存的內容:', content);
          // 驗證保存是否成功
          chrome.storage.local.get(['subtitles'], function(result) {
            console.log('驗證保存的字幕:', result.subtitles);
          });
          console.log('保存的內容:', content);
          // 顯示刪除按鈕
          document.getElementById('deleteBtn').style.display = 'block';
        });
      };
      // 以文本格式讀取文件
      reader.readAsText(file);
    } else {
      console.error('未選擇文件');
    }
});

// 為刪除按鈕添加點擊事件監聽器
document.getElementById('deleteBtn').addEventListener('click', function() {
    // 從 Chrome 的本地存儲中刪除字幕
    chrome.storage.local.remove('subtitles', function() {
        console.log('字幕已刪除');
        // 隱藏刪除按鈕
        document.getElementById('deleteBtn').style.display = 'none';
        // 清空文件輸入
        document.getElementById('subtitleFile').value = '';
    });
});

// 檢查是否已存在字幕，如果存在則顯示刪除按鈕
chrome.storage.local.get('subtitles', function(result) {
    if (result.subtitles) {
        document.getElementById('deleteBtn').style.display = 'block';
    }
});