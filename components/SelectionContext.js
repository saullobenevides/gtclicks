'use client';

import { createContext, useContext } from 'react';

export const SelectionContext = createContext({
  selectedIds: new Set(),
  toggleSelection: () => {},
  isSelectionMode: false,
});

export const useSelection = () => useContext(SelectionContext);
