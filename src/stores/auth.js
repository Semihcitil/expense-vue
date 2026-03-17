import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(true)

  const isLoggedIn = computed(() => !!token.value)

  const init = async () => {
    if (token.value) {
      try {
        const res = await api.get('/auth/me')
        user.value = res.data.data
      } catch {
        token.value = null
        localStorage.removeItem('token')
      }
    }
    loading.value = false
  }

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token: t, user: u } = res.data.data
    localStorage.setItem('token', t)
    token.value = t
    user.value = u
  }

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password })
    const { token: t, user: u } = res.data.data
    localStorage.setItem('token', t)
    token.value = t
    user.value = u
  }

  const logout = () => {
    localStorage.removeItem('token')
    token.value = null
    user.value = null
  }

  return { user, token, loading, isLoggedIn, init, login, register, logout }
})
