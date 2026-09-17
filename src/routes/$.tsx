import { createFileRoute } from "@tanstack/react-router";
import { NotFoundPage } from "@/lib/not-found";

export const Route = createFileRoute("/$")({
  component: NotFoundPage,
  head: () => ({ meta: [{ title: "Not found · Chambers" }] }),
});
