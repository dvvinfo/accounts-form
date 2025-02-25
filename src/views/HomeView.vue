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
      <span>Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;</span>
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
          <el-button
            type="danger"
            plain
            circle
            @click="removeCredential($index)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, Delete, InfoFilled } from '@element-plus/icons-vue';
import { useCredentialsStore } from '@/stores/credentials';

// Interfaces
interface Tag {
  text: string;
}

interface CredentialErrors {
  tags: boolean;
  type: boolean;
  login: boolean;
  password: boolean;
}

interface Credential {
  tags: Tag[];
  tagsInput: string;
  type: 'local' | 'ldap';
  login: string;
  password: string | null;
  errors: CredentialErrors;
}

// Store
const credentialsStore = useCredentialsStore();

// Data
const credentials = ref<Credential[]>([]);

// Methods
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
      password: false
    }
  });
};

const removeCredential = (index: number) => {
  credentials.value.splice(index, 1);
  saveCredentials();
};

const handleTagsBlur = (index: number) => {
  const credential = credentials.value[index];
  credential.tags = parseTagsInput(credential.tagsInput);
  validateCredential(index);
};

const handleTypeChange = (index: number) => {
  const credential = credentials.value[index];

  if (credential.type === 'ldap') {
    credential.password = null;
  } else if (credential.password === null) {
    credential.password = '';
  }

  validateCredential(index);
};

const parseTagsInput = (tagsString: string): Tag[] => {
  if (!tagsString) return [];

  return tagsString.split(';')
    .map(tag => tag.trim())
    .filter(tag => tag !== '')
    .map(tag => ({ text: tag }));
};

const formatTagsForInput = (tags: Tag[]): string => {
  if (!tags || tags.length === 0) return '';
  return tags.map(tag => tag.text).join('; ');
};

const validateCredential = (index: number) => {
  const credential = credentials.value[index];

  // Reset errors
  credential.errors = {
    tags: false,
    type: false,
    login: false,
    password: false
  };

  // Validate login (required)
  if (!credential.login.trim()) {
    credential.errors.login = true;
  }

  // Validate password (required for local type)
  if (credential.type === 'local' && (!credential.password || credential.password.trim() === '')) {
    credential.errors.password = true;
  }

  // Check if credential is valid
  const isValid = !Object.values(credential.errors).some(error => error);

  if (isValid) {
    saveCredentials();
  }

  return isValid;
};

const saveCredentials = () => {
  // Create a clean version without temporary or UI-only properties
  const cleanCredentials = credentials.value.map(({ tags, type, login, password }) => ({
    tags,
    type,
    login,
    password
  }));

  credentialsStore.saveCredentials(cleanCredentials);
};

const spanMethod = ({ row, column }) => {
  if (column.label === 'Логин' && row.type === 'ldap') {
    return [1, 2]; // Объединить ячейки по горизонтали
  }
  if (column.label === 'Пароль' && row.type === 'ldap') {
    return [0, 0]; // Скрыть ячейку
  }
  return [1, 1];
};

// Lifecycle hooks
onMounted(() => {
  const savedCredentials = credentialsStore.getCredentials();
  if (savedCredentials.length > 0) {
    credentials.value = savedCredentials.map(cred => ({
      ...cred,
      tagsInput: formatTagsForInput(cred.tags),
      errors: {
        tags: false,
        type: false,
        login: false,
        password: false
      }
    }));
  } else {
    addCredential();
  }
});
</script>

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
  background-color: transparent !important;
}

.credentials-table :deep(td) {
  border-bottom: 1px solid #ebeef5 !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
}

.credentials-table :deep(th) {
  border-bottom: 1px solid #dcdfe6 !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  font-weight: 600;
}

.w-full {
  width: 100%;
}

:deep(.el-input.is-error .el-input__wrapper),
:deep(.el-select.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset !important;
}

/* Добавляем немного отступов между строками таблицы */
:deep(.el-table__row) {
  height: 60px;
}
:deep(.el-table__row .cell) {
  padding: 0;
}
</style>
