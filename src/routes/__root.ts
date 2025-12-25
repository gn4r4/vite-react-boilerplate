import { createRootRoute } from '@tanstack/react-router';
import { MainLayout } from '../pages/MainLayout';

export const Route = createRootRoute({
  component: MainLayout, // Передаємо компонент напряму, без <Tags />
});