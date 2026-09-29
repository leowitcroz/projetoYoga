import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import LoginPainel from './telas/LoginPainel.vue';

describe('Login do painel', () => {
  it('mostra o título e pede e-mail e senha', () => {
    const wrapper = mount(LoginPainel, {
      global: { stubs: { RouterLink: true }, mocks: { $router: { replace: () => {} } } },
    });

    expect(wrapper.find('h1').text()).toBe('LIFE · Painel');
    expect(wrapper.find('input[type=email]').exists()).toBe(true);
    expect(wrapper.find('input[type=password]').exists()).toBe(true);
  });

  it('avisa que as contas são criadas pela administração', () => {
    const wrapper = mount(LoginPainel, {
      global: { stubs: { RouterLink: true }, mocks: { $router: { replace: () => {} } } },
    });

    expect(wrapper.text()).toContain('criadas pela administração');
  });
});
