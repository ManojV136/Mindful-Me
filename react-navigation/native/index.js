import React from 'react';

export function NavigationContainer({ children }) {
  return <>{children}</>;
}

export function createNavigationContainerRef() {
  return { current: null };
}

export function useNavigationContainerRef() {
  return { current: null };
}