import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import WelcomePage from '@/views/WelcomePage.vue';

const push = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }));

describe('WelcomePage.vue', () => {
  it('mostra a chamada da marca', () => {
    const wrapper = mount(WelcomePage);
    expect(wrapper.text()).toContain('Mais que um app.');
    expect(wrapper.text()).toContain('Uma jornada de vida.');
  });

  it('leva para o login ao tocar em Entrar', async () => {
    const wrapper = mount(WelcomePage);
    await wrapper.findAll('button').at(-1)?.trigger('click');
    expect(push).toHaveBeenCalledWith('/login');
  });
});
