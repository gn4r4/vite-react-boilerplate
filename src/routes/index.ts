import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "../pages/Home";

export const Route = createFileRoute("/")({
	component: DashboardPage,
});
