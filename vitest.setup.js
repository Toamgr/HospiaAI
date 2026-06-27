// Vitest setup (Slice 4E.2) — minimal and local.
// Adds jest-dom matchers (toBeInTheDocument, toHaveFocus, toHaveAttribute, …) and unmounts the
// React tree after each test so specs stay isolated and deterministic.
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => { cleanup() })
