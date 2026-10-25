import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import ErrorBoundary from "./components/ErrorBoundary";
import AppContent from "./AppContent";
import HomePage from "./pages/HomePage";
import ProjectPage from "./pages/ProjectPage";
import NotFound from "./pages/NotFound";
import { alternatePath, parseRoute } from "./seo/routes";

interface AppProps {
  /** Current URL path; the language and page are derived from it (works identically on server and client). */
  pathname: string;
}

function App({ pathname }: AppProps) {
  const route = parseRoute(pathname);
  const switchHref = alternatePath(route, route.lang === "ar" ? "en" : "ar");

  let page = <NotFound />;
  if (route.kind === "home") page = <HomePage />;
  if (route.kind === "project" && route.project)
    page = <ProjectPage project={route.project} />;

  return (
    <ErrorBoundary>
      <LanguageProvider language={route.lang} switchHref={switchHref}>
        <ThemeProvider defaultTheme="light">
          <AppContent>{page}</AppContent>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
