const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('pages/HomePage.vue') },
      {
        path: 'kuldetes/:mission(robot|teszt|alkoto)',
        name: 'mission',
        component: () => import('pages/MissionPage.vue'),
        meta: { section: 'missions' }
      },
      { path: 'szakma', name: 'profession', component: () => import('pages/ProfessionPage.vue') },
      { path: 'tudastar', name: 'learn', component: () => import('pages/LearnPage.vue') },
      { path: 'jelvenyek', name: 'badges', component: () => import('pages/BadgesPage.vue') }
    ]
  },
  { path: '/:catchAll(.*)*', redirect: '/' }
]

export default routes
