import React from 'react';

export function createNativeStackNavigator() {
  return {
    Navigator: ({ children }) => <>{children}</>,
    Screen: ({ component: Component, ...props }) => <Component {...props} />
  };
}