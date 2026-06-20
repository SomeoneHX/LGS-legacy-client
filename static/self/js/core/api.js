const API_BASE_URL = (window.__API_URL__ || '/api');

async function apiRequest(method, path, body) {
  const url = API_BASE_URL + path;
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('auth_token');
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After');
    throw { code: 429, message: '请求过于频繁' + (retryAfter ? '，请等待 ' + retryAfter + ' 秒' : ''), retryAfter };
  }
  const json = await res.json();
  if (json.code !== 200) throw { code: json.code, message: json.message || '请求失败' };
  return json.data;
}

const api = {
  get: (path) => apiRequest('GET', path),
  post: (path, body) => apiRequest('POST', path, body),
  put: (path, body) => apiRequest('PUT', path, body),
};
