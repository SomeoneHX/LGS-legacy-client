function isLoggedIn() {
  return !!localStorage.getItem('auth_token');
}

function getToken() {
  return localStorage.getItem('auth_token');
}

function login() {
  Swal.fire({
    title: '请输入 Token',
    input: 'text',
    inputPlaceholder: '输入你的登录凭据喵！♥️',
    confirmButtonText: '就是这个喵！',
    showCancelButton: true,
    cancelButtonText: '不是这个喵...',
    preConfirm: async function (token) {
      if (!token) { Swal.showValidationMessage('Token 不能为空'); return; }
      localStorage.setItem('auth_token', token);
      try {
        const user = await fetchCurrentUser();
        if (!user) throw new Error('Token 无效');
        return user;
      } catch (err) {
        localStorage.removeItem('auth_token');
        Swal.showValidationMessage(err.message || 'Token 验证失败');
      }
    }
  }).then(function (result) {
    if (result.value) {
      updateSidebarAuth(result.value);
      Swal.fire({ icon: 'success', title: '登录成功', timer: 1500, showConfirmButton: false });
      navigate(window.location.pathname);
    }
  });
}

function logout() {
  localStorage.removeItem('auth_token');
  const base = window.__BASE_PATH__ || '';
  location.href = base + '/';
}

async function fetchCurrentUser() {
  try {
    return await api.get('/auth/me');
  } catch {
    return null;
  }
}

function updateSidebarAuth(user) {
  const loginItem = document.getElementById('sidebar-login');
  const userItem = document.getElementById('sidebar-user');
  const adminItem = document.getElementById('sidebar-admin');
  if (user) {
    if (loginItem) loginItem.style.display = 'none';
    if (userItem) {
      userItem.style.display = 'block';
      const img = userItem.querySelector('img');
      if (img) img.src = (user.registeredUser?.avatarUrl) || (window.__BASE_PATH__ || '') + '/static/self/img/default-avatar.svg';
      const nameSpan = userItem.querySelector('span');
      if (nameSpan) nameSpan.textContent = '退出登录';
    }
    if (adminItem) {
      adminItem.style.display = (user.role === -1 || user.role & (1 << 5)) ? 'block' : 'none';
    }
  } else {
    if (loginItem) loginItem.style.display = 'block';
    if (userItem) userItem.style.display = 'none';
    if (adminItem) adminItem.style.display = 'none';
  }
}

async function initAuth() {
  if (isLoggedIn()) {
    const user = await fetchCurrentUser();
    if (user) {
      updateSidebarAuth(user);
      return;
    }
    localStorage.removeItem('auth_token');
  }
  updateSidebarAuth(null);
}
