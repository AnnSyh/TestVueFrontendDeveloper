import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

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
  const accounts = ref<Account[]>([])

  // Загрузка из localStorage
  const loadFromStorage = () => {
    const saved = localStorage.getItem('accounts')
    if (saved) {
      accounts.value = JSON.parse(saved)
    }
  }

  // Сохранение в localStorage
  const saveToStorage = () => {
    localStorage.setItem('accounts', JSON.stringify(accounts.value))
  }

  // Автосохранение при изменении
  watch(accounts, saveToStorage, { deep: true })

  // Загружаем при инициализации
  loadFromStorage()

    const addAccount = () => {
    const newAccount: Account = {
        id: Date.now().toString(),
        labels: [],
        accountType: 'Локальная',
        login: '',
        password: '',
        errors: {}
    }
    accounts.value.push(newAccount)
    }

  const removeAllAccounts = () => {
    accounts.value = []
    }

  const removeAccount = (id: string) => {
    accounts.value = accounts.value.filter(account => account.id !== id)
  }

  const updateAccount = (id: string, updates: Partial<Account>) => {
    const account = accounts.value.find(a => a.id === id)
    if (account) {
      Object.assign(account, updates)
      validateAccount(account)
    }
  }

  const validateAccount = (account: Account) => {
    account.errors = {}

    if (!account.login.trim()) {
      account.errors.login = 'Логин обязателен'
    } else if (account.login.length > 100) {
      account.errors.login = 'Максимум 100 символов'
    }

    if (account.accountType === 'Локальная') {
      if (!account.password) {
        account.errors.password = 'Пароль обязателен'
      } else if (account.password.length > 100) {
        account.errors.password = 'Максимум 100 символов'
      }
    }

    return Object.keys(account.errors).length === 0
  }

  const parseLabels = (labelsString: string): { text: string }[] => {
    if (!labelsString.trim()) return []
    
    return labelsString
      .split(';')
      .map(label => label.trim())
      .filter(label => label.length > 0)
      .map(label => ({ text: label }))
  }

  const formatLabels = (labels: { text: string }[]): string => {
    return labels.map(label => label.text).join('; ')
  }

  return {
    accounts,
    addAccount,
    removeAllAccounts,
    removeAccount,
    updateAccount,
    validateAccount,
    parseLabels,
    formatLabels
  }
})