import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import { parseRoute } from "./seo/routes";
import { buildHead } from "./seo/head";
import "./index.css";

const container = document.getElementById("root")!;
const pathname = window.location.pathname;
const app = <App pathname={pathname} />;

// In dev there is no prerendered <head>, so set the essentials here; production HTML already has them.
const head = buildHead(parseRoute(pathname));
const isPrerendered = container.firstElementChild !== null;
document.documentElement.lang = head.lang;
document.documentElement.dir = head.dir;
if (!isPrerendered) document.title = head.title;

// Prerendered pages hydrate; the dev server (empty root) renders from scratch.
if (isPrerendered) hydrateRoot(container, app);
else createRoot(container).render(app);
