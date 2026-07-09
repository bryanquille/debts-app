import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useAuthStore } from "@/stores/authStore";
import { RootLayout } from "@/components/layout/rootLayout";
import { LandingLayout } from "@/components/layout/landingLayout";

export const Route = createRootRoute({
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