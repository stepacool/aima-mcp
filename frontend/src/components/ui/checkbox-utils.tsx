import * as React from 'react'

/**
 * Utility functions for managing checkbox state in lists
 */

export interface CheckboxState {
  [key: string]: boolean
}

/**
 * Toggle a checkbox state in a state object
 */
export function toggleCheckboxState(
  state: CheckboxState,
  key: string,
): CheckboxState {
  return {
    ...state,
    [key]: !state[key],
  }
}

/**
 * Set a checkbox state to a specific value
 */
export function setCheckboxState(
  state: CheckboxState,
  key: string,
  value: boolean,
): CheckboxState {
  return {
    ...state,
    [key]: value,
  }
}

/**
 * Initialize checkbox state from an array of selected keys
 */
export function initializeCheckboxState(
  selectedKeys: Array<string>,
): CheckboxState {
  return selectedKeys.reduce(
    (acc, key) => {
      acc[key] = true
      return acc
    },
    {} as CheckboxState,
  )
}

/**
 * Get selected keys from checkbox state
 */
export function getSelectedKeys(state: CheckboxState): Array<string> {
  return Object.entries(state)
    .filter(([_, value]) => value === true)
    .map(([key]) => key)
}

/**
 * Check if a key is selected in checkbox state
 */
export function isSelected(state: CheckboxState, key: string): boolean {
  return state[key] === true
}

/**
 * Hook for managing checkbox state
 */
export function useCheckboxState(initialSelected: Array<string> = []) {
  const [state, setState] = React.useState<CheckboxState>(() =>
    initializeCheckboxState(initialSelected),
  )

  const toggle = React.useCallback(
    (key: string) => {
      setState((prev) => toggleCheckboxState(prev, key))
    },
    [],
  )

  const set = React.useCallback((key: string, value: boolean) => {
    setState((prev) => setCheckboxState(prev, key, value))
  }, [])

  const selectedKeys = React.useMemo(() => getSelectedKeys(state), [state])

  const isKeySelected = React.useCallback(
    (key: string) => isSelected(state, key),
    [state],
  )

  return {
    state,
    toggle,
    set,
    selectedKeys,
    isSelected: isKeySelected,
  }
}
