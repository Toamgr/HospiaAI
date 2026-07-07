// Role-access consistency tests tied to the AI-authorization fix.
//
// They lock two invariants:
//  1. FB_DIRECTOR can reach the Cocktail Lab page (frontend gate) — which is why the
//     backend must authorize FB_DIRECTOR on the AI generation route.
//  2. Roles with no events surface (fb_director/chef/employee/bar_manager) must NOT be
//     treated as events users, so the global GET /api/events load is skipped for them
//     and never 403s on unrelated pages.

import { describe, it, expect } from 'vitest'
import { canAccessPage, canAccessEvents } from './roleConfig.js'

describe('Cocktail Lab access — frontend/backend must agree', () => {
  it('allows FB_DIRECTOR to reach the Cocktail Lab page', () => {
    expect(canAccessPage('fb_director', 'cocktailLab')).toBe(true)
  })

  it('allows bar_manager and admin to reach the Cocktail Lab page', () => {
    expect(canAccessPage('bar_manager', 'cocktailLab')).toBe(true)
    expect(canAccessPage('admin', 'cocktailLab')).toBe(true)
  })

  it('does not allow unrelated roles (employee) into the Cocktail Lab page', () => {
    expect(canAccessPage('employee', 'cocktailLab')).toBe(false)
  })
})

describe('Beverage Brief Inbox access — admin must not see or access it', () => {
  it('allows fb_director to reach beverageBriefInbox', () => {
    expect(canAccessPage('fb_director', 'beverageBriefInbox')).toBe(true)
  })

  it('does NOT allow admin to reach beverageBriefInbox, despite the global admin bypass', () => {
    expect(canAccessPage('admin', 'beverageBriefInbox')).toBe(false)
  })

  it('does not allow unrelated roles (bar_manager, employee) into beverageBriefInbox', () => {
    expect(canAccessPage('bar_manager', 'beverageBriefInbox')).toBe(false)
    expect(canAccessPage('employee', 'beverageBriefInbox')).toBe(false)
  })

  it('does not globally break admin access to unrelated pages', () => {
    expect(canAccessPage('admin', 'cocktailLab')).toBe(true)
    expect(canAccessPage('admin', 'operationalPulse')).toBe(true)
  })
})

describe('Owner Beverage Brief access — admin must not see or access it', () => {
  it('allows owner to reach beverageBrief', () => {
    expect(canAccessPage('owner', 'beverageBrief')).toBe(true)
  })

  it('does NOT allow admin to reach beverageBrief, despite the global admin bypass', () => {
    expect(canAccessPage('admin', 'beverageBrief')).toBe(false)
  })

  it('does not allow unrelated roles (fb_director, bar_manager, employee) into beverageBrief', () => {
    expect(canAccessPage('fb_director', 'beverageBrief')).toBe(false)
    expect(canAccessPage('bar_manager', 'beverageBrief')).toBe(false)
    expect(canAccessPage('employee', 'beverageBrief')).toBe(false)
  })

  it('does not globally break admin access to unrelated pages', () => {
    expect(canAccessPage('admin', 'cocktailLab')).toBe(true)
    expect(canAccessPage('admin', 'operationalPulse')).toBe(true)
    expect(canAccessPage('admin', 'ownerHome')).toBe(true)
  })
})

describe('canAccessEvents — gates the global /api/events load', () => {
  it('is true for events-capable roles', () => {
    expect(canAccessEvents('events_manager')).toBe(true)
    expect(canAccessEvents('manager')).toBe(true)
    expect(canAccessEvents('admin')).toBe(true)
  })

  it('is false for FB_DIRECTOR (no events surface) so /api/events is not called', () => {
    expect(canAccessEvents('fb_director')).toBe(false)
  })

  it('is false for chef and employee', () => {
    expect(canAccessEvents('chef')).toBe(false)
    expect(canAccessEvents('employee')).toBe(false)
  })

  it('accepts a user object, not only a role string', () => {
    expect(canAccessEvents({ role: 'fb_director' })).toBe(false)
    expect(canAccessEvents({ role: 'manager' })).toBe(true)
  })
})
