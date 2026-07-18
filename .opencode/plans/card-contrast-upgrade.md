# Plan: Card/Container Contrast Upgrade

## Problem
Cards, debt items, and other containers blend into the `bg-gray-100` page background because:
- `border-gray-200` is only 1 shade darker than `bg-gray-100` (almost invisible)
- `shadow-sm` provides very subtle depth
- `bg-gray-200` tab containers don't stand out from `bg-gray-100`
- Some cards (`profile.tsx`) have no border at all

## Solution
Upgrade all card/container borders from `gray-200` → `gray-300` (much more visible), and upgrade shadows from `sm` → `md` (more elevation).

## Changes Required

### 1. `routes/debts/index.tsx`
- **Tab container**: `bg-gray-200` → `bg-gray-300`
- **Debt items**: `border border-gray-200` → `border border-gray-300`, `shadow-sm` → `shadow-md`, hover: `shadow-md` → `shadow-lg`, hover border: `border-blue-300` → `border-blue-400`, dark border: `dark:border-gray-700` → `dark:border-gray-600`

### 2. `routes/debts/settled.tsx`
- **Tab container**: `bg-gray-200` → `bg-gray-300`
- **Debt items**: `border border-gray-200` → `border border-gray-300`, `shadow-sm` → `shadow-md`, hover: `shadow-md` → `shadow-lg`, hover border: `border-blue-300` → `border-blue-400`, dark border: `dark:border-gray-700` → `dark:border-gray-600`

### 3. `routes/debts/$id.tsx`
- **Detail card**: `border border-gray-200` → `border border-gray-300`, `shadow-sm` → `shadow-md`, dark border: `dark:border-gray-700` → `dark:border-gray-600`
- **Payment history card**: Same changes as detail card

### 4. `routes/debts/new.tsx`
- **Form card**: `border border-gray-200` → `border border-gray-300`, `shadow-sm` → `shadow-md`, dark border: `dark:border-gray-700` → `dark:border-gray-600`

### 5. `routes/profile.tsx`
- **3 profile cards** (avatar, edit form, password): Add `border border-gray-300`, `shadow-sm` → `shadow-md`, dark border: add `dark:border-gray-600`

### 6. `routes/notifications.tsx`
- **Notification items**: `border border-gray-200` → `border border-gray-300`, `shadow-sm` → `shadow-md`, hover border: `border-blue-300` → `border-blue-400`, dark border: `dark:border-gray-700` → `dark:border-gray-600`

### 7. `routes/login.tsx`
- **Login card**: `border border-gray-200` → `border border-gray-300`, dark border: `dark:border-gray-700` → `dark:border-gray-600` (keeps `shadow-lg`)

### 8. `routes/register.tsx`
- **Register card**: `border border-gray-200` → `border border-gray-300`, dark border: `dark:border-gray-700` → `dark:border-gray-600` (keeps `shadow-lg`)

### 9. `components/ui/modal.tsx`
- **Modal container**: `border border-gray-200` → `border border-gray-300`, dark border: `dark:border-gray-700` → `dark:border-gray-600` (keeps `shadow-2xl`)

### 10. `routes/index.tsx` (landing)
- **Feature cards**: Add `border border-gray-300`, `shadow-sm` → `shadow-md`, hover: `shadow-md` → `shadow-lg`, dark border: add `dark:border-gray-600`

## Files Not Modified
- `rootLayout.tsx` — sidebar/mobile header use `border-r`/`border-b` structural borders which are fine
- `input.tsx` — inputs already use `border-gray-400` (sufficient contrast)
- `button.tsx` — already updated in previous pass
- `userSearch.tsx` — already updated in previous pass
- `themeToggle.tsx` — already updated in previous pass
- `passwordStrength.tsx` — already updated in previous pass
- `paymentForm.tsx` — already updated in previous pass
- `__root.tsx` — no visual content
- `landingLayout.tsx` — header border is structural, not a card

## Verification
After applying, visually confirm on each page that cards have a clear visible border (`gray-300`) and noticeable shadow (`shadow-md`) against the `bg-gray-100` page background.
