import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import { carregarSessaoSalva, estaLogado } from '@/servicos/sessao';

// Abas vazias da Fase 0. As telas reais chegam nas Fases 4 e 5.
const placeholder = () => import('@/views/PlaceholderPage.vue');

const routes: RouteRecordRaw[] = [
  { path: '/', component: () => import('@/views/WelcomePage.vue') },
  { path: '/login', component: () => import('@/views/LoginPage.vue') },
  { path: '/onboarding', component: () => import('@/views/OnboardingPage.vue') },
  { path: '/onboarding/relacao', component: () => import('@/views/RelacaoYogaPage.vue') },
  { path: '/onboarding/saude', component: () => import('@/views/SaudePage.vue') },
  { path: '/onboarding/ayurveda', component: () => import('@/views/AyurvedaPage.vue') },
  { path: '/onboarding/preferencias', component: () => import('@/views/PreferenciasPage.vue') },
  { path: '/criar-conta', component: () => import('@/views/CriarContaPage.vue') },
  {
    path: '/checkin',
    component: () => import('@/views/DailyCheckinPage.vue'),
    meta: { conta: true },
  },
  {
    path: '/tabs/',
    component: TabsPage,
    meta: { conta: true },
    children: [
      { path: '', redirect: '/tabs/hoje' },
      { path: 'hoje', component: () => import('@/views/AreaDoClientePage.vue') },
      { path: 'praticar', component: placeholder, props: { title: 'Praticar' } },
      { path: 'aprender', component: placeholder, props: { title: 'Aprender' } },
      { path: 'ayurveda', component: placeholder, props: { title: 'Ayurveda' } },
      { path: 'cozinha', component: placeholder, props: { title: 'Cozinha' } },
      { path: 'eu', component: () => import('@/views/PerfilPage.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

/** Telas marcadas com `meta.conta` só abrem para quem está logado. */
router.beforeEach(async (para) => {
  await carregarSessaoSalva();

  if (para.meta.conta && !estaLogado()) return '/login';

  // Quem já entrou não precisa ver de novo a tela de boas-vindas nem o login.
  if ((para.path === '/' || para.path === '/login') && estaLogado()) return '/tabs/hoje';

  return true;
});

export default router;
