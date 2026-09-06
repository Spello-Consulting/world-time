import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { HomeView } from "./home-view";
import { RootView } from "./root-view";
import { ErrorBoundaryView } from "../ui";

const rootRoute = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootView,
  errorComponent: ErrorBoundaryView,
  notFoundComponent: () => {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="region-drag fixed top-0 right-0 left-0 h-13" />
        <p className="text-tertiary">Route not found</p>
      </div>
    );
  },
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeView,
  staticData: {
    title: "Home",
  },
});

const routeTree = rootRoute.addChildren([homeRoute]);

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  history: createMemoryHistory(),
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  context: {
    queryClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
  interface StaticDataRouteOption {
    title?: string;
  }
}

export { router, queryClient };
