<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="flex flex-wrap gap-4 justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Управление учетными записями</h1>
      <button
        type="button"
        @click="addAccount"
        class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
      >
        + Добавить запись
      </button>
      <button
        type="button"
        @click="removeAllAccounts"
        class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
      >
        - Удалить все
      </button>
    </div>

    <div v-for="account in accounts" :key="account.id" 
         :class="[
           'flex gap-4 flex-col md:flex-row1 rounded-lg shadow-md p-6 mb-4 transition-all',
           isDraft(account.id) ? 'bg-yellow-50 border border-yellow-200' : 'bg-white border border-green-200'
         ]">

        <div v-if="isDraft(account.id)" class="flex flex-row text-red-500">
             Заполните все обязательные поля для сохранения.
        </div>
        <div v-else class="text-green-500">
            Сохранено в localStorage
        </div>

        <div class="flex flex-row flex-1">
            <h3 class="flex items-center justify-center text-lg font-semibold mb-4 p-4">
              #{{ getAccountIndex(account.id) + 1 }}
              <span v-if="isDraft(account.id)" class="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded">Черновик</span>
            </h3>
    
            <div class="flex flex-col-reverse1 md:flex-row gap-4 md:items-start pb-8 w-full">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    
                    <div class="space-y-2 relative">
                        <label class="block text-sm font-medium text-gray-700">Метка</label>
                      <input
                            :value="getLabelsRaw(account.id)"
                            @input="handleLabelInput(account.id, $event)"
                            @blur="handleBlur(account)"
                            placeholder="Введите метки через ;"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxlength="50"
                        />
                        <p class="md:absolute text-xs text-gray-500 mt-1">Максимум 50 символов, разделитель ;</p>
                    </div>
    
                    <div class="space-y-2 relative">
                        <label class="block text-sm font-medium text-gray-700">Тип записи *</label>
                        <select
                            :value="account.accountType"
                            @change="handleAccountTypeChange(account.id, $event)"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="LDAP">LDAP</option>
                            <option value="Локальная">Локальная</option>
                        </select>
                    </div>
    
                    <div class="space-y-2 relative">
                        <label class="block text-sm font-medium text-gray-700">Логин *</label>
                        <input
                            :value="account.login"
                            @input="handleLoginInput(account.id, $event)"
                            @blur="handleBlur(account)"
                            :class="[
                            'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                            account.errors.login ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                            ]"
                            placeholder="Введите логин"
                            maxlength="100"
                        />
                        <p v-if="account.errors.login" class="text-red-500 text-xs mt-1">{{ account.errors.login }}</p>
                    </div>
    
                    <div v-if="account.accountType === 'Локальная'" class="space-y-2 relative">
                        <label class="block text-sm font-medium text-gray-700">Пароль *</label>
                        <input
                        type="password"
                        :value="account.password || ''"
                        @input="handlePasswordInput(account.id, $event)"
                        @blur="handleBlur(account)"
                        :class="[
                            'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                            account.errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        ]"
                        placeholder="Введите пароль"
                        maxlength="100"
                        />
                        <p v-if="account.errors.password" class="text-red-500 text-xs mt-1">{{ account.errors.password }}</p>
                    </div>
                </div>
    
                <button
                    type="button"
                    @click="removeAccount(account.id)"
                    class="mt-8 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition ml-auto self-center"
                    >
                    Удалить
                </button>
            </div>
        </div>

    </div>

    <div v-if="accounts.length === 0" class="text-center py-8 text-gray-500">
      Нет учетных записей. Нажмите "+ Добавить запись" чтобы создать первую.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAccountsStore } from '../stores/accounts'
import type { Account } from '../stores/accounts'

// Локальное хранилище для сырых значений меток
const labelsRawMap = ref<Record<string, string>>({})

const getLabelsRaw = (id: string): string => {
  if (labelsRawMap.value[id] !== undefined) {
    return labelsRawMap.value[id]
  }
  // Инициализируем из существующих данных
  const account = accounts.value.find(acc => acc.id === id)
  return account ? formatLabels(account.labels) : ''
}

const handleLabelInput = (id: string, event: Event) => {
  const value = (event.target as HTMLInputElement).value
  labelsRawMap.value[id] = value // Сохраняем сырую строку

}

const handleBlur = (account: Account) => {
  // При потере фокуса парсим и сохраняем
  const rawValue = labelsRawMap.value[account.id] || ''
  const labels = parseLabels(rawValue)
  updateAccount(account.id, { labels })
  
  // Затем валидируем и сохраняем
  validateAndSaveAccount(account)
}


const accountsStore = useAccountsStore()
const { accounts, draftAccounts } = storeToRefs(accountsStore)

const { 
  addAccount, 
  removeAllAccounts, 
  removeAccount, 
  updateAccount,
  validateAndSaveAccount,
  parseLabels,
  formatLabels
} = accountsStore


// Методы
const isDraft = (id: string): boolean => {
  return draftAccounts.value.some(acc => acc.id === id)
}

const getAccountIndex = (id: string): number => {
  return accounts.value.findIndex(acc => acc.id === id)
}

const updateAccountType = (id: string, type: 'LDAP' | 'Локальная') => {
  const updates: Partial<Account> = { 
    accountType: type,
    password: type === 'LDAP' ? null : ''
  }
  updateAccount(id, updates)
  
  // Если это черновик, сразу пытаемся сохранить после смены типа
  const account = accounts.value.find(acc => acc.id === id)
  if (account && isDraft(id)) {
    validateAndSaveAccount(account)
  }
}

const updateLogin = (id: string, login: string) => {
  updateAccount(id, { login })
}

const updatePassword = (id: string, password: string) => {
  updateAccount(id, { password })
}


const handleAccountTypeChange = (id: string, event: Event) => {
  const value = (event.target as HTMLSelectElement).value as 'LDAP' | 'Локальная'
  updateAccountType(id, value)
}

const handleLoginInput = (id: string, event: Event) => {
  const value = (event.target as HTMLInputElement).value
  updateLogin(id, value)
}

const handlePasswordInput = (id: string, event: Event) => {
  const value = (event.target as HTMLInputElement).value
  updatePassword(id, value)
}
</script>