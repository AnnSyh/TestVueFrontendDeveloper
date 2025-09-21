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

    
    <div v-for="account in accounts" :key="account.id" class="flex flex-col md:flex-row bg-white rounded-lg shadow-md p-6 mb-4">
        
        <h3 class="flex items-center justify-center text-lg font-semibold mb-4 p-4">#{{ accounts.indexOf(account) + 1 }}</h3>

        <div class="flex flex-col-reverse md:flex-row gap-4 md:items-start pb-8">

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <div class="space-y-2 relative">
                    <label class="block text-sm font-medium text-gray-700">Метка</label>
                    <input
                        :value="formatLabels(account.labels)"
                        @input="updateLabels(account.id, $event.target.value)"
                        @blur="validateAccount(account)"
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
                        @change="updateAccountType(account.id, $event.target.value)"
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
                        @input="updateLogin(account.id, $event.target.value)"
                        @blur="validateAccount(account)"
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
                    @input="updatePassword(account.id, $event.target.value)"
                    @blur="validateAccount(account)"
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
                class="mt-8 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                Удалить
            </button>
        </div>

    </div>


    <div v-if="accounts.length === 0" class="text-center py-8 text-gray-500">
      Нет учетных записей. Нажмите "+ Добавить запись" чтобы создать первую.
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAccountsStore } from '../stores/accounts'
import type { Account } from '../stores/accounts'

const accountsStore = useAccountsStore()
const { accounts } = storeToRefs(accountsStore)

// Методы store используем напрямую из экземпляра
const { 
  addAccount: storeAddAccount, 
  removeAllAccounts: storeRemoveAllAccounts, 
  removeAccount: storeRemoveAccount, 
  updateAccount: storeUpdateAccount,
  validateAccount: storeValidateAccount,
  parseLabels: storeParseLabels,
  formatLabels: storeFormatLabels
} = accountsStore

const addAccount = () => {
  storeAddAccount()
}

const removeAllAccounts = () => {
  storeRemoveAllAccounts()
}
const removeAccount = (id: string) => {
  storeRemoveAccount(id)
}

const updateLabels = (id: string, labelsString: string) => {
  const labels = storeParseLabels(labelsString)
  storeUpdateAccount(id, { labels })
}

const updateAccountType = (id: string, type: 'LDAP' | 'Локальная') => {
  const updates: Partial<Account> = { 
    accountType: type,
    password: type === 'LDAP' ? null : ''
  }
  storeUpdateAccount(id, updates)
}

const updateLogin = (id: string, login: string) => {
  storeUpdateAccount(id, { login })
}

const updatePassword = (id: string, password: string) => {
  storeUpdateAccount(id, { password })
}

const validateAccount = (account: Account) => {
  storeValidateAccount(account)
}

const formatLabels = (labels: { text: string }[]): string => {
  return storeFormatLabels(labels)
}


</script>
