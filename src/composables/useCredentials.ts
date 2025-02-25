import { ref, onMounted } from 'vue'
import { useCredentialsStore } from '@/stores/credentials'

interface Tag {
  text: string
}

interface CredentialErrors {
  tags: boolean
  type: boolean
  login: boolean
  password: boolean
}

interface Credential {
  tags: Tag[]
  tagsInput: string
  type: 'local' | 'ldap'
  login: string
  password: string | null
  errors: CredentialErrors
}

interface SpanMethodParams {
  row: Credential
  column: { label: string }
  rowIndex: number
  columnIndex: number
}

export function useCredentials() {
  const credentialsStore = useCredentialsStore()
  const credentials = ref<Credential[]>([])

  const addCredential = () => {
    credentials.value.push({
      tags: [],
      tagsInput: '',
      type: 'local',
      login: '',
      password: '',
      errors: {
        tags: false,
        type: false,
        login: false,
        password: false,
      },
    })
  }

  const removeCredential = (index: number) => {
    credentials.value.splice(index, 1)
    saveCredentials()
  }

  const handleTagsBlur = (index: number) => {
    const credential = credentials.value[index]
    credential.tags = parseTagsInput(credential.tagsInput)
    validateCredential(index)
  }

  const handleTypeChange = (index: number) => {
    const credential = credentials.value[index]

    if (credential.type === 'ldap') {
      credential.password = null
    } else if (credential.password === null) {
      credential.password = ''
    }

    validateCredential(index)
  }

  const parseTagsInput = (tagsString: string): Tag[] => {
    if (!tagsString) return []

    return tagsString
      .split(';')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '')
      .map((tag) => ({ text: tag }))
  }

  const formatTagsForInput = (tags: Tag[]): string => {
    if (!tags || tags.length === 0) return ''
    return tags.map((tag) => tag.text).join('; ')
  }

  const validateCredential = (index: number) => {
    const credential = credentials.value[index]

    // Reset errors
    credential.errors = {
      tags: false,
      type: false,
      login: false,
      password: false,
    }

    // Validate login (required)
    if (!credential.login.trim()) {
      credential.errors.login = true
    }

    // Validate password (required for local type)
    if (
      credential.type === 'local' &&
      (!credential.password || credential.password.trim() === '')
    ) {
      credential.errors.password = true
    }

    // Check if credential is valid
    const isValid = !Object.values(credential.errors).some((error) => error)

    if (isValid) {
      saveCredentials()
    }

    return isValid
  }

  const saveCredentials = () => {
    // Create a clean version without temporary or UI-only properties
    const cleanCredentials = credentials.value.map(({ tags, type, login, password }) => ({
      tags,
      type,
      login,
      password,
    }))

    credentialsStore.saveCredentials(cleanCredentials)
  }

  const spanMethod = ({ row, column }: SpanMethodParams) => {
    if (column.label === 'Логин' && row.type === 'ldap') {
      return [1, 2] // Объединить ячейки по горизонтали
    }
    if (column.label === 'Пароль' && row.type === 'ldap') {
      return [0, 0] // Скрыть ячейку
    }
    return [1, 1]
  }

  onMounted(() => {
    const savedCredentials = credentialsStore.getCredentials()
    if (savedCredentials.length > 0) {
      credentials.value = savedCredentials.map((cred) => ({
        ...cred,
        tagsInput: formatTagsForInput(cred.tags),
        errors: {
          tags: false,
          type: false,
          login: false,
          password: false,
        },
      }))
    } else {
      addCredential()
    }
  })

  return {
    credentials,
    addCredential,
    removeCredential,
    handleTagsBlur,
    handleTypeChange,
    validateCredential,
    spanMethod,
  }
}
