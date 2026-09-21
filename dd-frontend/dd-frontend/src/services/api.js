import axios from 'axios'

const api = axios.create({ baseURL: '/api' })


api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('dd_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})


api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dd_token')
      localStorage.removeItem('dd_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

export const chatAPI = {
  send: (message, chatId) => api.post('/chat', { message, chatId }),
}

export const decisionsAPI = {
  getAll:  (orgId) => api.get('/decisions', { params: { orgId } }),
  getById: (id)    => api.get(`/decisions/${id}`),
  ask:     (data)  => api.post('/decisions', data),
}

export const uploadAPI = {
  upload:      (file, orgId) => {
    const fd = new FormData()
    fd.append('file', file)
    if (orgId) fd.append('orgId', orgId)
    return api.post('/upload', fd)
  },
  getDatasets: (orgId) => api.get('/upload/datasets', { params: { orgId } }),
}

export const analyticsAPI = {
  getSummary: (orgId) => api.get('/analytics/summary', { params: { orgId } }),
  getAudit:   (orgId) => api.get('/analytics/audit',   { params: { orgId } }),
}

export default api
