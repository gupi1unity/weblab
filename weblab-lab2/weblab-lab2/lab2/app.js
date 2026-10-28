const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const postsContainer = document.getElementById('postsContainer');
const postForm = document.getElementById('postForm');
const submitBtn = document.getElementById('submitBtn');
const reloadBtn = document.getElementById('reloadBtn');
const loader = document.getElementById('loader');
const statusMessage = document.getElementById('statusMessage');

async function fetchPosts() {
    postsContainer.innerHTML = '';
    loader.classList.remove('hidden');

    try {
        const response = await fetch(`${API_URL}?_limit=8`);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const posts = await response.json();
        renderPosts(posts);
    } catch (error) {
        postsContainer.innerHTML = `<p class="status-error">Не удалось загрузить посты: ${error.message}</p>`;
    } finally {
        loader.classList.add('hidden');
    }
}

function renderPosts(posts) {
    postsContainer.innerHTML = '';
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post-card';
    article.dataset.id = post.id;

    article.innerHTML = `
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.body)}</p>
        <button class="btn btn-danger" onclick="deletePost(${post.id}, this)">Удалить</button>
    `;

    return article;
}

postForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titleInput = document.getElementById('title');
    const bodyInput = document.getElementById('body');

    const newPost = {
        title: titleInput.value.trim(),
        body: bodyInput.value.trim(),
        userId: 1
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    statusMessage.textContent = '';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify(newPost)
        });

        if (!response.ok) {
            throw new Error(`Ошибка при создании: ${response.status}`);
        }

        const createdPost = await response.json();

        const postElement = createPostElement(createdPost);
        postsContainer.prepend(postElement);

        postForm.reset();
        showStatus('Пост успешно опубликован (ID: ' + createdPost.id + ')', 'success');
    } catch (error) {
        showStatus(`Ошибка: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Опубликовать';
    }
});

async function deletePost(id, buttonElement) {
    const card = buttonElement.closest('.post-card');
    buttonElement.disabled = true;
    buttonElement.textContent = 'Удаление...';

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Ошибка удаления: ${response.status}`);
        }

        card.style.opacity = '0';
        card.style.transform = 'translateX(20px)';
        setTimeout(() => card.remove(), 300);
    } catch (error) {
        alert(`Не удалось удалить пост: ${error.message}`);
        buttonElement.disabled = false;
        buttonElement.textContent = 'Удалить';
    }
}

function showStatus(text, type) {
    statusMessage.textContent = text;
    statusMessage.className = `status-message status-${type}`;
    setTimeout(() => {
        statusMessage.textContent = '';
    }, 4000);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

reloadBtn.addEventListener('click', fetchPosts);
document.addEventListener('DOMContentLoaded', fetchPosts);