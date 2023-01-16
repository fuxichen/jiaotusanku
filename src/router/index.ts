import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "jtsk",
      component: () => import("@/views/jtskView.vue"),
      meta: {
        title: "狡兔三窟",
      },
    },
    {
      path: "/jttl",
      name: "jttl",
      component: () => import("../views/jttlView.vue"),
      meta: {
        title: "鸡兔同笼",
      },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const title = (to.meta.title as string) || "bycandy的掘金代码";
  document.title = title;
  next();
});

export default router;
