let posts = [];
let news = [];
let lastMessageTime = 0;
const adminPassword = "$$hidi0$$"; // Закодированный пароль
const WRONG = false; // Если true, сервис недоступен

function loadData() {
  posts = JSON.parse(localStorage.getItem('posts')) || [];
  news = JSON.parse(localStorage.getItem('news')) || [];
}

function saveData() {
  localStorage.setItem('posts', JSON.stringify(posts));
  localStorage.setItem('news', JSON.stringify(news));
}

function displayPosts(containerId, data) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  data.forEach(item => {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.textContent = item.text;
    const timeElement = document.createElement('div');
    timeElement.className = 'post-time';
    timeElement.textContent = `Time: ${item.time} | ID: ${item.id}`;
    postElement.appendChild(timeElement);
    container.appendChild(postElement);
  });
}

function getCurrentTime() {
  const now = new Date();
  return `${now.getHours()}:${now.getMinutes()}`;
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function showUnavailablePage() {
  document.body.innerHTML = `
    <div class="unavailable-container">
      <div class="emoji">❌</div>
      <h1>Service Unavailable</h1>
      <p>Sorry, the service is currently unavailable. Please try again later.</p>
    </div>
  `;
}

function showCustomMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.className = 'custom-message';
  messageElement.textContent = message;
  document.body.appendChild(messageElement);
  setTimeout(() => {
    messageElement.remove();
  }, 3000);
}

function switchSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden');
  });
  document.getElementById(sectionId).classList.remove('hidden');
}

function updateSwitchButtonPosition(tabId) {
  const tab = document.getElementById(tabId);
  const switchButton = document.getElementById('switchButton');
  const tabRect = tab.getBoundingClientRect();
  switchButton.style.width = `${tabRect.width}px`;
  switchButton.style.transform = `translateX(${tab.offsetLeft}px)`;
}

function updateHeaderEmoji(sectionId) {
  const emojiMap = {
    chatSection: '💬',
    newsSection: '📰',
    adminSection: '🔒'
  };
  document.getElementById('headerEmoji').textContent = emojiMap[sectionId];
}

document.addEventListener('DOMContentLoaded', () => {
  if (WRONG) {
    showUnavailablePage();
    return;
  }

  loadData();

  // Инициализация разделов
  switchSection('chatSection');
  updateSwitchButtonPosition('chatTab');
  updateHeaderEmoji('chatSection');
  displayPosts('postsContainer', posts);
  displayPosts('newsContainer', news);

  // Переключение между разделами
  document.getElementById('chatTab').addEventListener('click', () => {
    switchSection('chatSection');
    updateSwitchButtonPosition('chatTab');
    updateHeaderEmoji('chatSection');
  });

  document.getElementById('newsTab').addEventListener('click', () => {
    switchSection('newsSection');
    updateSwitchButtonPosition('newsTab');
    updateHeaderEmoji('newsSection');
  });

  document.getElementById('adminTab').addEventListener('click', () => {
    switchSection('adminSection');
    updateSwitchButtonPosition('adminTab');
    updateHeaderEmoji('adminSection');
  });

  // Отправка сообщений
  const messageInput = document.getElementById('messageInput');
  messageInput.addEventListener('keypress', (e) => {
    const currentTime = Date.now();
    if (e.key === 'Enter' && messageInput.value.trim()) {
      if (currentTime - lastMessageTime >= 60000) {
        posts.push({ id: generateId(), text: messageInput.value.trim(), time: getCurrentTime() });
        saveData();
        displayPosts('postsContainer', posts);
        messageInput.value = '';
        lastMessageTime = currentTime;
      } else {
        showCustomMessage('Please wait 1 minute before sending another message.');
      }
    }
  });

  // Админ-панель
  const adminLogin = document.getElementById('adminLogin');
  adminLogin.addEventListener('click', () => {
    const password = document.getElementById('adminPassword').value;
    if (password === adminPassword) {
      document.getElementById('adminPanel').classList.add('hidden');
      document.getElementById('adminControls').classList.remove('hidden');
    } else {
      showCustomMessage('Incorrect password!');
    }
  });

  const sendNews = document.getElementById('sendNews');
  sendNews.addEventListener('click', () => {
    const newsText = document.getElementById('newsInput').value.trim();
    if (newsText) {
      news.push({ id: generateId(), text: newsText, time: getCurrentTime() });
      saveData();
      displayPosts('newsContainer', news);
      showCustomMessage('News sent!');
      document.getElementById('newsInput').value = '';
    }
  });

  const deleteNews = document.getElementById('deleteNews');
  deleteNews.addEventListener('click', () => {
    const id = document.getElementById('deleteNewsById').value.trim();
    news = news.filter(item => item.id !== id);
    saveData();
    displayPosts('newsContainer', news);
    showCustomMessage('News deleted!');
  });

  const deleteChatMessage = document.getElementById('deleteChatMessage');
  deleteChatMessage.addEventListener('click', () => {
    const id = document.getElementById('deleteChatById').value.trim();
    posts = posts.filter(post => post.id !== id);
    saveData();
    displayPosts('postsContainer', posts);
    showCustomMessage('Chat message deleted!');
  });

  const clearChat = document.getElementById('clearChat');
  clearChat.addEventListener('click', () => {
    posts = [];
    saveData();
    displayPosts('postsContainer', posts);
    showCustomMessage('Chat cleared!');
  });

  // Обработка ENTER в админ-панели
  document.getElementById('newsInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendNews.click();
    }
  });

  document.getElementById('deleteNewsById').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      deleteNews.click();
    }
  });

  document.getElementById('deleteChatById').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      deleteChatMessage.click();
    }
  });
});
