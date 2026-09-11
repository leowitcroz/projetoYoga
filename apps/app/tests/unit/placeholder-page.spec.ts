import { mount } from '@vue/test-utils';
import PlaceholderPage from '@/views/PlaceholderPage.vue';
import { describe, expect, test } from 'vitest';

describe('PlaceholderPage.vue', () => {
  test('mostra o título da aba', () => {
    const wrapper = mount(PlaceholderPage, { props: { title: 'Hoje' } });
    expect(wrapper.text()).toContain('Hoje: em construção.');
  });
});
