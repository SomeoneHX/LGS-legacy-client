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
    inputPlaceholder: '输入你的登录凭据',
    confirmButtonText: '登录',
    showCancelButton: true,
    cancelButtonText: '取消',
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
    }
  });
}

function logout() {
  localStorage.removeItem('auth_token');
  location.href = '/';
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
  const logoutItem = document.getElementById('sidebar-logout');
  const adminItem = document.getElementById('sidebar-admin');
  if (user) {
    if (loginItem) loginItem.style.display = 'none';
    if (userItem) {
      userItem.style.display = 'flex';
      const img = userItem.querySelector('img');
      if (img) img.src = (user.registeredUser?.avatarUrl) || '/static/self/img/default-avatar.svg';
    }
    if (logoutItem) logoutItem.style.display = 'flex';
    if (adminItem) {
      adminItem.style.display = (user.role === -1 || user.role & (1 << 5)) ? 'flex' : 'none';
    }
  } else {
    if (loginItem) loginItem.style.display = 'flex';
    if (userItem) userItem.style.display = 'none';
    if (logoutItem) logoutItem.style.display = 'none';
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
