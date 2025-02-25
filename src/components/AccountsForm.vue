<script setup lang="ts">
import { Plus, Delete, InfoFilled } from '@element-plus/icons-vue'
import { useCredentials } from '@/composables/useCredentials'

const {
  credentials,
  addCredential,
  removeCredential,
  handleTagsBlur,
  handleTypeChange,
  validateCredential,
  spanMethod,
} = useCredentials()
</script>

<template>
  <div class="credentials-container">
    <div class="header">
      <h2>Учетные записи</h2>
      <el-button type="primary" plain @click="addCredential">
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>

    <div class="info-tip">
      <el-icon><InfoFilled /></el-icon>
      <span
        >Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;</span
      >
    </div>

    <el-table
      :data="credentials"
      class="credentials-table"
      :border="false"
      :cell-style="{ padding: '5px' }"
      :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      :span-method="spanMethod"
    >
      <el-table-column label="Метки" min-width="220">
        <template #default="{ row, $index }">
          <el-input
            v-model="row.tagsInput"
            placeholder="XXX"
            maxlength="50"
            :class="{ 'is-error': row.errors.tags }"
            @blur="handleTagsBlur($index)"
          />
        </template>
      </el-table-column>

      <el-table-column label="Тип записи" min-width="180">
        <template #default="{ row, $index }">
          <el-select
            v-model="row.type"
            class="w-full"
            :class="{ 'is-error': row.errors.type }"
            @change="handleTypeChange($index)"
          >
            <el-option label="Локальная" value="local" />
            <el-option label="LDAP" value="ldap" />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column label="Логин" min-width="180">
        <template #default="{ row, $index }">
          <el-input
            v-model="row.login"
            placeholder="Значение"
            maxlength="100"
            :class="{ 'is-error': row.errors.login }"
            @blur="validateCredential($index)"
          />
        </template>
      </el-table-column>

      <el-table-column label="Пароль" min-width="180">
        <template #default="{ row, $index }">
          <el-input
            v-if="row.type === 'local'"
            v-model="row.password"
            placeholder="Значение"
            maxlength="100"
            type="password"
            show-password
            :class="{ 'is-error': row.errors.password }"
            @blur="validateCredential($index)"
          />
          <template v-else>
            <!-- Пустое место для LDAP типа -->
          </template>
        </template>
      </el-table-column>

      <el-table-column width="70" align="center">
        <template #default="{ $index }">
          <el-button type="danger" plain circle @click="removeCredential($index)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.credentials-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px 0;
}

.header {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 16px;
}

.info-tip {
  background-color: #f0f7ff;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.credentials-table {
  width: 100%;
  margin-top: 8px;
}

.credentials-table :deep(tr) {
  background-color: transparent;
}

.credentials-table :deep(td) {
  border-bottom: 1px solid #ebeef5;
  border-top: none;
  border-right: none;
}

.credentials-table :deep(th) {
  border-bottom: 1px solid #dcdfe6;
  border-top: none;
  border-left: none;
  border-right: none;
  font-weight: 600;
}

.w-full {
  width: 100%;
}

:deep(.el-input.is-error .el-input__wrapper),
:deep(.el-select.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset;
}

:deep(.el-table__row .cell) {
  padding: 0;
}
</style>
