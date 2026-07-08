// End-to-end journeys through the real UI. Each test gets a fresh browser
// context (clean IndexedDB), so the app boots into Margaret's example.
// Zero console/page errors is an assertion, not a hope.

import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const errorsOf = (page: Page): string[] => {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[console] ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
  return errors
}

test('demo journey: guide progress, trend card, offer check', async ({ page }) => {
  const errors = errorsOf(page)

  await page.goto('#/guide')
  await expect(page.locator('h1')).toHaveText('Getting Ready')
  await expect(page.getByText('9 of 11 steps done')).toBeVisible()
  await expect(page.getByText('Print or share the family summary').first()).toBeVisible()

  // Trend card with the kind-decline pattern on the china set
  await page.goto('#/binder')
  await page.getByRole('link', { name: /Living Room/ }).first().click()
  await page.getByRole('link', { name: /Wedgwood China Set/ }).first().click()
  await expect(page.getByText('What it sells for today')).toBeVisible()
  await expect(page.getByText('not its value to your family')).toBeVisible()

  // Offer check: lowball verdict + face-saving script
  await page.goto('#/check')
  await page.locator('select').first().selectOption({ label: 'Silver Dollar Collection' })
  await page.getByPlaceholder('200').fill('200')
  await page.getByRole('button', { name: 'Check this offer' }).click()
  await expect(page.getByText(/no thank you/i)).toBeVisible()
  await expect(page.getByText('never decide on the spot')).toBeVisible()

  expect(errors).toEqual([])
})

test('offer check refuses to judge a custom item without a value', async ({ page }) => {
  const errors = errorsOf(page)
  await page.goto('#/check')
  await page.locator('select').first().selectOption('other')
  await page.getByPlaceholder('Silver tea service').fill('Old mirror')
  await page.getByPlaceholder('200').fill('50')
  await page.getByRole('button', { name: 'Check this offer' }).click()
  // Honest inline error, no verdict card, no silent no-op
  await expect(page.getByText(/rough sense of what it’s worth/)).toBeVisible()
  await expect(page.getByText(/no thank you/i)).not.toBeVisible()
  expect(errors).toEqual([])
})

test('fresh binder: add, persist, edit details, rooms, search', async ({ page }) => {
  const errors = errorsOf(page)

  await page.goto('#/start')
  await page.getByRole('radio', { name: 'It’s for me' }).click()
  await page.getByPlaceholder('Margaret').fill('Harold')
  await page.getByRole('button', { name: 'Create my binder' }).click()
  await expect(page.locator('h1')).toHaveText('Add something precious')

  // Skip photo → blank details (never a fabricated identification)
  await page.getByRole('button', { name: /add a photo later/ }).click()
  await page.locator('input').first().fill('Blue Vase')
  await page.locator('select').first().selectOption('Antiques')
  await page.getByPlaceholder('1200').fill('300')
  await page.getByPlaceholder('Where did it come from? What’s its history?').fill('From the flea market in 1972.')
  await page.getByPlaceholder('Why it matters — a sentence is plenty.').fill('It was the first thing we bought together.')
  await page.getByRole('button', { name: 'Save to my binder' }).click()
  await expect(page.locator('h1')).toHaveText('Blue Vase')
  await expect(page.getByText('first thing we bought together')).toBeVisible()

  // Persistence across reload (IndexedDB)
  await page.reload()
  await expect(page.locator('h1')).toHaveText('Blue Vase')

  // Edit details: a wrong category is never permanent
  await page.getByRole('button', { name: 'Edit details' }).click()
  await page.locator('select').first().selectOption('Jewelry')
  await page.getByPlaceholder('1968, our wedding year').fill('1972, the flea market')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('Jewelry').first()).toBeVisible()
  await expect(page.getByText('1972, the flea market')).toBeVisible()

  // Rooms: add + rename
  await page.goto('#/binder')
  await page.getByRole('button', { name: 'Add a room' }).click()
  await page.getByPlaceholder('Kitchen, Study, The Attic…').fill('The Study')
  await page.getByRole('button', { name: 'Add it' }).click()
  await page.getByRole('link', { name: /The Study/ }).click()
  await page.getByRole('button', { name: 'Rename The Study' }).click()
  await page.locator('input').first().fill('The Library')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.locator('h1')).toContainText('The Library')

  // Search finds the item by a story word
  await page.goto('#/binder')
  await page.getByPlaceholder(/Search by name, category/).fill('flea')
  await expect(page.getByRole('link', { name: /Blue Vase/ }).first()).toBeVisible()

  expect(errors).toEqual([])
})

test('the example binder is recoverable and never clobbers the user’s data', async ({ page }) => {
  const errors = errorsOf(page)

  // Create a real binder…
  await page.goto('#/start')
  await page.getByRole('radio', { name: 'It’s for me' }).click()
  await page.getByPlaceholder('Margaret').fill('Harold')
  await page.getByRole('button', { name: 'Create my binder' }).click()
  await expect(page.locator('h1')).toHaveText('Add something precious')

  // …open the example…
  await page.goto('#/')
  await page.getByRole('button', { name: /See an example/ }).click()
  await expect(page.getByText('You’re looking at Margaret’s example binder.')).toBeVisible()
  await expect(page.locator('h1')).toHaveText("Margaret's Binder")

  // …and leave it: Harold's binder is intact.
  await page.getByRole('button', { name: 'Leave the example' }).click()
  await expect(page.locator('h1')).toHaveText("Harold's Binder")
  await expect(page.getByText('You’re looking at Margaret’s example binder.')).not.toBeVisible()

  expect(errors).toEqual([])
})

test('sectioned emergency guide + item significance', async ({ page }) => {
  const errors = errorsOf(page)

  // The guide is sectioned like the family planners made by hand
  await page.goto('#/emergency')
  await expect(page.getByRole('heading', { name: 'Final arrangements' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Money & accounts' })).toBeVisible()
  await expect(page.getByText('never write account numbers')).toBeVisible()
  // Margaret's cremation wishes live under Final arrangements
  await expect(page.getByText('Be Thou My Vision')).toBeVisible()

  // A prompt chip pre-fills the section and title
  await page.getByRole('button', { name: 'Notes for my obituary' }).click()
  await expect(page.getByLabel('What is it?')).toHaveValue('Notes for my obituary')

  // Significance shows on the item and inside the trend card's meaning context
  await page.goto('#/binder')
  await page.getByRole('link', { name: /Engagement Ring/ }).first().click()
  await expect(page.getByText('What it means')).toBeVisible()
  await expect(page.getByText('holding her hand').first()).toBeVisible()

  expect(errors).toEqual([])
})

test('backup export downloads a complete JSON file', async ({ page }) => {
  const errors = errorsOf(page)
  await page.goto('#/plan')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download everything' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^keepsake-binder-\d{4}-\d{2}-\d{2}\.json$/)
  const path = await download.path()
  const { readFileSync } = await import('node:fs')
  const parsed = JSON.parse(readFileSync(path!, 'utf-8'))
  expect(parsed.binderName).toBe("Margaret's Binder")
  expect(Array.isArray(parsed.items)).toBe(true)
  expect(Array.isArray(parsed._diagnostics)).toBe(true)
  expect(errors).toEqual([])
})

test('gift flow lands on the guide in Together mode', async ({ page }) => {
  const errors = errorsOf(page)
  await page.goto('#/start')
  await page.getByRole('radio', { name: /someone I love/ }).click()
  await page.getByPlaceholder('Margaret').fill('Dorothy')
  await page.getByPlaceholder('Sarah').fill('Michael')
  await page.getByRole('button', { name: 'Create their binder' }).click()
  await expect(page.locator('h1')).toHaveText('Getting Ready')
  // Together mode is ON from the first moment — the promised magic moment
  await expect(page.locator('#together')).toHaveValue('p-gifter')
  await expect(page.getByText('For Michael')).toBeVisible()
  await expect(page.getByText('yard sale').first()).toBeVisible()
  expect(errors).toEqual([])
})
