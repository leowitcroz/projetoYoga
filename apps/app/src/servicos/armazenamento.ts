import { Preferences } from '@capacitor/preferences';

/**
 * Guarda coisas no aparelho. No navegador o Capacitor usa localStorage;
 * no app usa o armazenamento nativo. O resto do código não precisa saber.
 */
export async function guardar(chave: string, valor: unknown): Promise<void> {
  await Preferences.set({ key: chave, value: JSON.stringify(valor) });
}

export async function ler<T>(chave: string): Promise<T | null> {
  const { value } = await Preferences.get({ key: chave });
  if (value === null) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    // Valor estragado (versão antiga do app, por exemplo): melhor ignorar.
    return null;
  }
}

export async function apagar(chave: string): Promise<void> {
  await Preferences.remove({ key: chave });
}
