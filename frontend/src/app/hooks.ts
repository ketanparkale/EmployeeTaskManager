import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Typed versions of Redux's hooks so we get autocomplete + type safety.
// - useAppDispatch(): send actions to the store (e.g. "log in").
// - useAppSelector(): read values out of the store (e.g. the current user).
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
