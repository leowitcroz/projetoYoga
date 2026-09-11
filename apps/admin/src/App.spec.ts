import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import App from './App.vue';

describe('App.vue', () => {
  it('mostra o título do painel', () => {
    const wrapper = mount(App);
    expect(wrapper.find('h1').text()).toBe('LIFE · Painel');
  });
});
