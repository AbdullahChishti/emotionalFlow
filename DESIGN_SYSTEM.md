# EmotionEconomy Design System

## 🎨 Centralized Color Management

All colors are managed in one place to make updates easy and consistent across the entire application.

### 📍 Where to Update Colors

**Primary Location**: `src/styles/design-tokens.ts`

```typescript
export const colors = {
  // Update these 5 main colors and they'll apply everywhere
  backgroundLight: '#AFEEEE',    // Main screen panels
  primarySurface: '#A8D5BA',     // Cards, modals
  accent: '#98FF98',             // Primary call-to-action, toggles
  textPrimary: '#333333',        // Body text, labels, iconography
  secondaryAccent: '#B2AC88',    // Secondary buttons, status indicators
  
  // ... rest of the design system derives from these
}
```

## 🔧 How to Use the Design System

### 1. Using Design Tokens in Components

```typescript
import { useDesignTokens } from '@/hooks/useDesignTokens'

function MyComponent() {
  const tokens = useDesignTokens()
  
  return (
    <div style={{ 
      backgroundColor: tokens.colors.primarySurface,
      color: tokens.colors.textPrimary 
    }}>
      Content
    </div>
  )
}
```

### 2. Using Pre-built Components

```typescript
import { Button, Card, Input } from '@/components/ui'

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button variant="primary">Submit</Button>
    </Card>
  )
}
```

### 3. Using CSS Classes

```typescript
function MyComponent() {
  return (
    <div className="card">
      <button className="btn-primary">Click me</button>
      <button className="btn-secondary">Or me</button>
    </div>
  )
}
```

### 4. Using Tailwind Classes

```typescript
function MyComponent() {
  return (
    <div className="bg-primary-surface text-text-primary">
      <button className="bg-accent hover:bg-button-primary-hover">
        Button
      </button>
    </div>
  )
}
```

### 5. Using CSS Custom Properties

```css
.my-custom-component {
  background-color: var(--color-primary-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
}
```

## 🎯 Available Design Tokens

### Colors
- `backgroundLight` - Main screen panels (#AFEEEE)
- `primarySurface` - Cards, modals (#A8D5BA)
- `accent` - Primary CTA, toggles (#98FF98)
- `textPrimary` - Body text, labels (#333333)
- `secondaryAccent` - Secondary buttons (#B2AC88)

### Semantic Color Groups
- `background.*` - Background variations
- `surface.*` - Surface/card variations
- `text.*` - Text color variations
- `button.*` - Button state colors
- `border.*` - Border color variations
- `status.*` - Success, warning, error, info
- `mood.*` - Mood-specific colors

### Spacing
- `xs` (4px), `sm` (8px), `md` (16px), `lg` (24px), `xl` (32px), `2xl` (48px), `3xl` (64px)

### Typography
- Font families, sizes, and weights

### Border Radius
- `sm`, `md`, `lg`, `xl`, `full`

### Shadows
- `sm`, `md`, `lg`, `xl`

## 🔄 How to Update Colors

### Option 1: Update Design Tokens (Recommended)
1. Open `src/styles/design-tokens.ts`
2. Update the main color values
3. All components automatically use the new colors

### Option 2: Update CSS Custom Properties
1. Open `src/app/globals.css`
2. Update the `:root` CSS variables
3. Changes apply immediately

### Option 3: Update Tailwind Config
1. Open `tailwind.config.ts`
2. The config automatically imports from design tokens
3. Rebuild required for Tailwind classes

## 📦 Pre-built Components

### Button
```typescript
<Button variant="primary|secondary|outline" size="sm|md|lg">
  Click me
</Button>
```

### Card
```typescript
<Card variant="default|elevated">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Input
```typescript
<Label>Email</Label>
<Input type="email" placeholder="Enter email" error={false} />
<Textarea placeholder="Enter message" />
```

## 🎨 CSS Utility Classes

### Buttons
- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.btn-outline` - Outline button style

### Cards
- `.card` - Standard card
- `.card-elevated` - Elevated card with more shadow

### Inputs
- `.input` - Standard input field
- `.modal` - Modal container

### Status
- `.status-success`, `.status-warning`, `.status-error`, `.status-info`

### Text Colors
- `.text-primary`, `.text-secondary`, `.text-tertiary`, `.text-inverse`

### Backgrounds
- `.bg-primary`, `.bg-secondary`, `.bg-surface`

### Borders
- `.border-primary`, `.border-secondary`

## 🚀 Best Practices

1. **Always use design tokens** instead of hardcoded colors
2. **Use pre-built components** when possible
3. **Use CSS classes** for consistent styling
4. **Update colors in one place** (design-tokens.ts)
5. **Test color changes** across all components
6. **Use semantic color names** (e.g., `accent` not `green`)

## 🔍 Examples

### Updating the Primary Color
```typescript
// In src/styles/design-tokens.ts
export const colors = {
  accent: '#FF6B6B', // Changed from #98FF98 to red
  // ... rest stays the same
}
```

This single change updates:
- All primary buttons
- All accent colors
- All focus states
- All hover states
- All Tailwind classes
- All CSS custom properties

### Adding a New Color
```typescript
// In src/styles/design-tokens.ts
export const colors = {
  // ... existing colors
  newBrand: '#FF5722', // Add new color
  
  // Add to semantic groups
  button: {
    // ... existing
    tertiary: '#FF5722', // Use new color
  }
}
```

Then use it:
```typescript
<Button variant="tertiary">New Button</Button>
// or
<div className="bg-button-tertiary">Content</div>
// or
<div style={{ backgroundColor: tokens.colors.button.tertiary }}>Content</div>
```

## 🎯 Summary

✅ **Single source of truth** for all colors  
✅ **Easy to update** - change once, applies everywhere  
✅ **Type-safe** design tokens  
✅ **Multiple usage patterns** (React, CSS, Tailwind)  
✅ **Consistent** across the entire app  
✅ **Scalable** design system  

Your EmotionEconomy color palette is now centrally managed and can be updated in seconds! 🎨
