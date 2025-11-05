// stores/accounts.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Account {
  id: string
  labels: { text: string }[]
  accountType: 'LDAP' | 'Локальная'
  login: string
  password: string | null
  errors: {
    login?: string
    password?: string
  }
}

export const useAccountsStore = defineStore('accounts', () => {
  // Временные данные  -  без валидации
  const draftAccounts = ref<Account[]>([])
  
  // Сохраненные данные - прошли валидацию и сохранены в localStorage
  const savedAccounts = ref<Account[]>([])

  // Компьютированное свойство для отображения (объединяет черновики и сохраненные)
  const accounts = computed( () => 
    [ ...draftAccounts.value, ...savedAccounts.value]
  )

  // Загрузка из localStorage при инициализации
  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem('savedAccounts')
    if (stored) {
      savedAccounts.value = JSON.parse(stored)
    }
  }

  // Сохранение в localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem('savedAccounts', JSON.stringify(savedAccounts.value))
  }

  // Добавление новой записи (сначала как черновик)
  const addAccount = () => {
    const newAccount: Account = {
      id: generateId(),
      labels: [],
      accountType: 'LDAP',
      login: '',
      password: null,
      errors: {}
    }
    draftAccounts.value.unshift(newAccount)
  }

  // Удаление записи
  const removeAccount = (id: string) => {
    // Удаляем из черновиков
    draftAccounts.value = draftAccounts.value.filter(acc => acc.id !== id)
    // Удаляем из сохраненных
    savedAccounts.value = savedAccounts.value.filter(acc => acc.id !== id)
    saveToLocalStorage()
  }

  // Удаление всех записей
  const removeAllAccounts = () => {
    draftAccounts.value = []
    savedAccounts.value = []
    saveToLocalStorage()
  }

  // Обновление записи
  const updateAccount = (id: string, updates: Partial<Account>) => {
    // Сначала ищем в черновиках
    let account = draftAccounts.value.find(acc => acc.id === id)
    
    // Если не нашли в черновиках, ищем в сохраненных
    if (!account) {
      account = savedAccounts.value.find(acc => acc.id === id)
    }
    
    if (account) {
      Object.assign(account, updates)
    }
  }

  // Валидация и финализация записи
  const validateAndSaveAccount = (account: Account) => {
    const errors: { login?: string; password?: string } = {}
    
    // Валидация логина
    if (!account.login.trim()) {
      errors.login = 'Логин обязателен'
    } else if (account.login.length > 100) {
      errors.login = 'Максимум 100 символов'
    }
    
    // Валидация пароля для локальных аккаунтов
    if (account.accountType === 'Локальная') {
      if (!account.password?.trim()) {
        errors.password = 'Пароль обязателен для локальных учетных записей'
      } else if (account.password.length > 100) {
        errors.password = 'Максимум 100 символов'
      }
    }
    
    account.errors = errors
    
    // Если ошибок нет - перемещаем из черновиков в сохраненные
    if (Object.keys(errors).length === 0) {
      // Удаляем из черновиков
      draftAccounts.value = draftAccounts.value.filter(acc => acc.id !== account.id)
      
      // Добавляем в сохраненные (если еще нет)
      if (!savedAccounts.value.find(acc => acc.id === account.id)) {
        savedAccounts.value.push({ ...account })
      }
      
      saveToLocalStorage()
      return true
    }
    
    return false
  }

  // Валидация без сохранения (только проверка)
  const validateAccount = (account: Account) => {
    const errors: { login?: string; password?: string } = {}
    
    if (!account.login.trim()) {
      errors.login = 'Логин обязателен'
    } else if (account.login.length > 100) {
      errors.login = 'Максимум 100 символов'
    }
    
    if (account.accountType === 'Локальная') {
      if (!account.password?.trim()) {
        errors.password = 'Пароль обязателен для локальных учетных записей'
      } else if (account.password.length > 100) {
        errors.password = 'Максимум 100 символов'
      }
    }
    
    account.errors = errors
    return Object.keys(errors).length === 0
  }

  // Вспомогательные функции
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  const parseLabels = (labelsString: string): { text: string }[] => {
    return labelsString.split(';')
      .map(label => label.trim())
      .filter(label => label.length > 0)
      .map(text => ({ text }))
  }

  const formatLabels = (labels: { text: string }[]): string => {
    return labels.map(label => label.text).join('; ')
  }

  // Инициализация
  loadFromLocalStorage()

  return {
    accounts,
    draftAccounts,
    savedAccounts,
    addAccount,
    removeAccount,
    removeAllAccounts,
    updateAccount,
    validateAccount,
    validateAndSaveAccount,
    parseLabels,
    formatLabels,
    loadFromLocalStorage,
    saveToLocalStorage
  }
})