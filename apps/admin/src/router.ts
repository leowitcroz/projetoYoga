import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { sessao } from './servicos/api.js';

const rotas: RouteRecordRaw[] = [
  { path: '/', component: () => import('./telas/PainelInicio.vue'), meta: { protegida: true } },
  { path: '/entrar', component: () => import('./telas/LoginPainel.vue') },
  {
    path: '/conteudos',
    component: () => import('./telas/ListaDeConteudos.vue'),
    meta: { protegida: true },
  },
  {
    path: '/conteudos/nova',
    component: () => import('./telas/FichaDaPratica.vue'),
    meta: { protegida: true },
  },
  {
    path: '/conteudos/:id',
    component: () => import('./telas/FichaDaPratica.vue'),
    meta: { protegida: true },
  },
  {
    path: '/trilhas',
    component: () => import('./telas/ListaDeTrilhas.vue'),
    meta: { protegida: true },
  },
  {
    path: '/trilhas/nova',
    component: () => import('./telas/FichaDaTrilha.vue'),
    meta: { protegida: true },
  },
  {
    path: '/trilhas/:id',
    component: () => import('./telas/FichaDaTrilha.vue'),
    meta: { protegida: true },
  },
  {
    path: '/alunos',
    component: () => import('./telas/ListaDeAlunos.vue'),
    meta: { protegida: true },
  },
  {
    path: '/revisao',
    component: () => import('./telas/FilaDeRevisao.vue'),
    meta: { protegida: true },
  },
];

const router = createRouter({ history: createWebHistory(), routes: rotas });

router.beforeEach((para) => {
  if (para.meta.protegida && !sessao.value) return '/entrar';
  if (para.path === '/entrar' && sessao.value) return '/';
  return true;
});

export default router;
