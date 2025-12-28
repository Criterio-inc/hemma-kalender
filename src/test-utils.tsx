/// <reference types="@testing-library/jest-dom" />
import React, { ReactElement, ReactNode } from 'react';
import { render as rtlRender, RenderOptions, renderHook as rtlRenderHook, RenderHookOptions } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { act } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SeasonalThemeProvider } from '@/contexts/SeasonalThemeContext';
import userEvent from '@testing-library/user-event';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

function AllProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SeasonalThemeProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </SeasonalThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function render(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return rtlRender(ui, { wrapper: AllProviders, ...options });
}

function renderHook<Result, Props>(
  hook: (props: Props) => Result,
  options?: RenderHookOptions<Props>
) {
  return rtlRenderHook(hook, options);
}

function QueryWrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export { render, renderHook, screen, fireEvent, waitFor, act, userEvent, QueryWrapper, createTestQueryClient };
