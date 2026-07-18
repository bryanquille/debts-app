import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui";
import { ThemeToggle } from "@/components/ui/themeToggle";
import { useRouter } from "@tanstack/react-router";

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Inicio", href: "/" },
    { label: "Caracteristicas", href: "/#features" },
    { label: "Como funciona", href: "/#how-it-works" },
  ];

  const handleNav = (href: string) => {
    setMobileMenuOpen(false);
    if (href === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      router.navigate({ to: "/" });
    } else if (href.startsWith("/#")) {
      const id = href.slice(2);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        router.navigate({ to: "/" });
        setTimeout(() => {
          const el2 = document.getElementById(id);
          el2?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      router.navigate({ to: href as any });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button onClick={() => handleNav("/")} className="text-xl font-bold text-blue-600 cursor-pointer">
            Debts App
          </button>
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <button key={link.href} onClick={() => handleNav(link.href)}
                className="cursor-pointer text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => router.navigate({ to: "/login" })}>
              Iniciar Sesion
            </Button>
            <Button size="sm" onClick={() => router.navigate({ to: "/register" })}>
              Registrarse
            </Button>
          </div>
          <button
            className="cursor-pointer rounded-lg p-2 text-gray-700 hover:bg-gray-200 md:hidden dark:text-gray-400 dark:hover:bg-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="border-t bg-white px-4 pb-6 pt-4 dark:border-gray-700 dark:bg-gray-900 md:hidden">
            <nav className="mb-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <button key={link.href} onClick={() => handleNav(link.href)}
                  className="cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  {link.label}
                </button>
              ))}
            </nav>
            <div className="mb-3"><ThemeToggle /></div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full" onClick={() => { setMobileMenuOpen(false); router.navigate({ to: "/login" }); }}>
                Iniciar Sesion
              </Button>
              <Button className="w-full" onClick={() => { setMobileMenuOpen(false); router.navigate({ to: "/register" }); }}>
                Registrarse
              </Button>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-gray-100 dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Debts App. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <button onClick={() => handleNav("/#features")} className="cursor-pointer text-sm text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                Caracteristicas
              </button>
              <button onClick={() => handleNav("/#how-it-works")} className="cursor-pointer text-sm text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                Como funciona
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
