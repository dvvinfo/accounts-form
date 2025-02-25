// stores/credentials.ts
import { defineStore } from 'pinia';

interface Tag {
  text: string;
}

interface Credential {
  tags: Tag[];
  type: 'local' | 'ldap';
  login: string;
  password: string | null;
  tagsInput?: string; // Только для UI, не хранится
  errors?: {
    tags: boolean;
    type: boolean;
    login: boolean;
    password: boolean;
  };
}

export const useCredentialsStore = defineStore('credentials', {
  state: () => ({
    credentials: [] as Credential[]
  }),

  actions: {
    saveCredentials(credentials: Credential[]) {
      // Создаем чистую версию без UI-свойств для хранения
      const cleanCredentials = credentials.map(({ tags, type, login, password }) => ({
        tags,
        type,
        login,
        password
      }));

      this.credentials = cleanCredentials;

      // Сохраняем в localStorage
      localStorage.setItem('credentials', JSON.stringify(cleanCredentials));
    },

    getCredentials(): Credential[] {
      // Если у нас есть учетные данные в состоянии, возвращаем их
      if (this.credentials.length > 0) {
        return this.credentials;
      }

      // Иначе пытаемся загрузить из localStorage
      const storedCredentials = localStorage.getItem('credentials');
      if (storedCredentials) {
        try {
          this.credentials = JSON.parse(storedCredentials);
          return this.credentials;
        } catch (error) {
          console.error('Не удалось разобрать сохраненные учетные данные:', error);
        }
      }

      return [];
    }
  }
});
