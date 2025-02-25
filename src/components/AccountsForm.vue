<!-- AccountsForm.vue -->
<template>
  <div class="accounts-form">
    <h2>Учетные записи</h2>
    <el-button @click="addNewAccount" type="primary">+</el-button>

    <p class="hint">Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;</p>

    <div v-for="(account, index) in accounts" :key="index" class="account-entry">
      <el-form :model="account" :rules="rules" ref="form" @validate="validateAccount(index)">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="Метка" prop="label">
              <el-input
                v-model="account.label"
                :maxlength="50"
                placeholder="Введите метку"
                @blur="updateAccount(index, { label: account.label })"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Тип записи" prop="type">
              <el-select
                v-model="account.type"
                placeholder="Выберите тип"
                @change="handleTypeChange(index)"
              >
                <el-option label="Локальная" value="Локальная" />
                <el-option label="LDAP" value="LDAP" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Логин" prop="login">
              <el-input
                v-model="account.login"
                :maxlength="100"
                placeholder="Введите логин"
                @blur="updateAccount(index, { login: account.login })"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if="account.type === 'Локальная'">
            <el-form-item label="Пароль" prop="password">
              <el-input
                v-model="account.password"
                type="password"
                :maxlength="100"
                placeholder="Введите пароль"
                @blur="updateAccount(index, { password: account.password })"
              />
            </el-form-item>
          </el-col>
          <el-col :span="1">
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="removeAccount(index)"
            />
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useAccountsStore } from '../stores/credentials'
import { ElForm } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const accountsStore = useAccountsStore()
const accounts = accountsStore.accounts
const form = ref<FormInstance>()

const rules: FormRules = {
  login: [{ required: true, message: 'Логин обязателен', trigger: 'blur' }],
  password: [
    { required: true, message: 'Пароль обязателен', trigger: 'blur' }
  ], // Only for "Локальная"
  type: [{ required: true, message: 'Тип записи обязателен', trigger: 'change' }]
}

function addNewAccount() {
  accountsStore.addAccount()
}

function removeAccount(index: number) {
  accountsStore.removeAccount(index)
}

function updateAccount(index: number, data: Partial<Account>) {
  accountsStore.updateAccount(index, data)
}

function handleTypeChange(index: number) {
  const account = accounts.value[index]
  if (account.type === 'LDAP') {
    updateAccount(index, { password: null })
  }
  // Trigger validation
  validateAccount(index)
}

function validateAccount(index: number) {
  if (!form.value) return
  form.value.validate((valid) => {
    if (valid) {
      // Account is valid, save/update in store
      updateAccount(index, accounts.value[index])
    } else {
      // Mark fields with red border (handled by Element Plus validation)
    }
  })
}

// Persist data (e.g., using localStorage or Vuex/Pinia persistence plugin)
watch(accounts, (newAccounts) => {
  localStorage.setItem('accounts', JSON.stringify(newAccounts))
}, { deep: true })

// Load persisted data on mount
onMounted(() => {
  const savedAccounts = localStorage.getItem('accounts')
  if (savedAccounts) {
    accountsStore.accounts = JSON.parse(savedAccounts)
  }
})
</script>

<style scoped>
.accounts-form {
  padding: 20px;
}

.account-entry {
  margin-bottom: 20px;
  border: 1px solid #eee;
  padding: 10px;
}

.hint {
  color: #666;
  font-size: 12px;
  margin-bottom: 10px;
}
</style>
