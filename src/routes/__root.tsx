import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster
        position="bottom-center"
        toastOptions={{
          className: "hairline !bg-paper !text-ink !rounded-md !shadow-chambers !font-sans",
        }}
      />
    </>
  ),
});
