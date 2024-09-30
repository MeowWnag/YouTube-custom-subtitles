console.log("字幕擴展已加載");

// 初始化全局變量
console.log("Subtitle extension loaded");
let subtitles = [];

// 立即檢查存儲中的字幕
chrome.storage.local.get(['subtitles'], function(result) {
  console.log('檢查存儲中的字幕:', result.subtitles ? '存在' : '不存在');
  if (result.subtitles) {
    console.log('字幕內容:', result.subtitles.substring(0, 100) + '...'); // 只顯示前100個字符
    subtitles = parseSubtitles(result.subtitles);
    console.log('解析後的字幕:', subtitles.slice(0, 3)); // 只顯示前3個字幕對象
    injectSubtitleContainer();
  } else {
    console.log('未找到保存的字幕');
  }
});

// 監聽存儲變化
chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (let key in changes) {
    if (key === 'subtitles') {
      console.log('字幕存儲發生變化:', changes[key].newValue);
      subtitles = parseSubtitles(changes[key].newValue);
      console.log('更新後的字幕:', subtitles);
      injectSubtitleContainer();
    }
  }
});

// 解析SRT格式的字幕內容
function parseSubtitles(content) {
  console.log('開始解析字幕');
  const subtitleArray = [];
  const subtitleBlocks = content.split('\n\n');
  
  subtitleBlocks.forEach((block, index) => {
    const lines = block.split('\n');
    console.log(`解析第 ${index + 1} 個字幕塊:`, lines);
    if (lines.length >= 3) {
      const timeCode = lines[1].split(' --> ');
      if (timeCode.length === 2) {
        try {
          subtitleArray.push({
            start: timeStringToSeconds(timeCode[0]),
            end: timeStringToSeconds(timeCode[1]),
            text: lines.slice(2).join(' ')
          });
        } catch (error) {
          console.error(`解析第 ${index + 1} 個字幕塊時出錯:`, error);
        }
      } else {
        console.warn(`第 ${index + 1} 個字幕塊的時間碼格式不正確:`, lines[1]);
      }
    } else {
      console.warn(`第 ${index + 1} 個字幕塊格式不正確:`, lines);
    }
  });
  
  console.log('字幕解析完成，共解析出', subtitleArray.length, '條字幕');
  return subtitleArray;
}

// 將時間字符串轉換為秒數
function timeStringToSeconds(timeString) {
  if (!timeString || typeof timeString !== 'string') {
    console.error('無效的時間字符串:', timeString);
    return 0;
  }
  const [hours, minutes, secondsAndMs] = timeString.split(':');
  if (!secondsAndMs) {
    console.error('時間字符串格式不正確:', timeString);
    return 0;
  }
  const [seconds, ms] = secondsAndMs.split(',');
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds) + parseInt(ms) / 1000;
}

// 在頁面中注入字幕容器
function injectSubtitleContainer() {
  console.log('開始注入字幕容器');
  const container = document.createElement('div');
  container.id = 'custom-subtitle-container';
  // 設置字幕容器的樣式
  container.style.position = 'absolute';
  container.style.bottom = '70px';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.textAlign = 'center';
  container.style.color = 'white';
  container.style.textShadow = '0 0 2px black';
  container.style.fontSize = '20px';
  container.style.zIndex = '1000';

  // 將字幕容器添加到視頻播放器中
  const videoPlayer = document.querySelector('.html5-video-player');
  if (videoPlayer) {
    videoPlayer.appendChild(container);
    console.log('字幕容器已注入');
    setInterval(updateSubtitle, 100);
  } else {
    console.log('未找到視頻播放器元素');
  }
}

// 更新字幕顯示
function updateSubtitle() {
  const video = document.querySelector('video');
  const container = document.getElementById('custom-subtitle-container');
  
  if (video && container) {
    const currentTime = video.currentTime;
    const currentSubtitle = subtitles.find(sub => currentTime >= sub.start && currentTime <= sub.end);
    
    if (currentSubtitle) {
      container.textContent = currentSubtitle.text;
      console.log('更新字幕:', currentSubtitle.text);
    } else {
      container.textContent = '';
    }
  } else {
    console.log('未找到視頻或字幕容器元素');
  }
}