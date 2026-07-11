import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useAuthStore } from "@/stores/authStore";
import { RootLayout } from "@/components/layout/rootLayout";
import { LandingLayout } from "@/components/layout/landingLayout";

const publicPaths = ["/", "/login", "/register"];

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated && !publicPaths.includes(location.pathname)) {
      throw redirect({ to: "/login" });
    }
  },
  component: RootComponent,
});

function RootComponent() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const Layout = isAuthenticated ? RootLayout : LandingLayout;

  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      {process.env.NODE_ENV === "development" && <TanStackRouterDevtools />}
    </>
  );
}