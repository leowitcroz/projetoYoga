import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';

// Abas vazias da Fase 0. As telas reais chegam nas Fases 4 e 5.
const placeholder = () => import('@/views/PlaceholderPage.vue');

const routes: RouteRecordRaw[] = [
  { path: '/', component: () => import('@/views/WelcomePage.vue') },
  { path: '/login', component: () => import('@/views/LoginPage.vue') },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      { path: '', redirect: '/tabs/hoje' },
      { path: 'hoje', component: placeholder, props: { title: 'Hoje' } },
      { path: 'praticar', component: placeholder, props: { title: 'Praticar' } },
      { path: 'aprender', component: placeholder, props: { title: 'Aprender' } },
      { path: 'ayurveda', component: placeholder, props: { title: 'Ayurveda' } },
      { path: 'cozinha', component: placeholder, props: { title: 'Cozinha' } },
      { path: 'eu', component: placeholder, props: { title: 'Eu' } },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
