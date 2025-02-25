import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Tag {
  text: string
}

interface Credential {
  tags: Tag[]
  type: 'local' | 'ldap'
  login: string
  password: string | null
  tagsInput?: string 
  errors?: {
    tags: boolean
    type: boolean
    login: boolean
    password: boolean
  }
}

export const useCredentialsStore = defineStore('credentials', () => {
  const credentials = ref<Credential[]>([])

  const saveCredentials = (newCredentials: Credential[]) => {
    // Создаем чистую версию без UI-свойств для хранения
    const cleanCredentials = newCredentials.map(({ tags, type, login, password }) => ({
      tags,
      type,
      login,
      password,
    }))

    credentials.value = cleanCredentials

    // Сохраняем в localStorage
    localStorage.setItem('credentials', JSON.stringify(cleanCredentials))
  }

  const getCredentials = (): Credential[] => {
    // Если у нас есть учетные данные в состоянии, возвращаем их
    if (credentials.value.length > 0) {
      return credentials.value
    }

    // Иначе пытаемся загрузить из localStorage
    const storedCredentials = localStorage.getItem('credentials')
    if (storedCredentials) {
      try {
        credentials.value = JSON.parse(storedCredentials)
        return credentials.value
      } catch (error) {
        console.error('Не удалось разобрать сохраненные учетные данные:', error)
      }
    }

    return []
  }

  return {
    credentials,
    saveCredentials,
    getCredentials,
  }
})
