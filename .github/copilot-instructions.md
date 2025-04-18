# Coding Guidelines

---

## 🧠 Philosophy

- Code should **speak for itself**
- Think in **components**, not files or layers
- Prioritize **readability and developer intent**
- We believe in **fun**, **fluid UX** — we embrace micro animations, juice, and clarity

> "Make it fun to use. If it feels good, it probably *is* good."

---

## 🧑‍💻 Tackling problems

Whenever we tackle a problem we first "take a step back" and think about "what kind of problem is this?" and "which known patterns are in effect here or could we use?".

Asking these questions first help us to see the bigger picture and find solutions that are well tested and easy to understand for future devs.

---

## 🧠 TypeScript

- Use `type` over `interface`
  > _Why?_ More consistent behavior and better for union types

- Avoid `enum`s
  > _Why?_ Union types are more idiomatic in TypeScript and have better runtime characteristics

- Clear naming
  > _Why?_ Self-documenting code reduces maintenance burden and improves team communication

- Always use `type` instead of `interface`
- Avoid `enum`s — use union types instead:

```ts
// ✅
type Role = 'admin' | 'user' | 'guest'

// 🚫
enum Role {
  Admin,
  User,
  Guest
}
```

- Enforce strict typings — avoid `any`
- Use clear, meaningful names for types and functions
- Write **self-documenting code** but use comments where assumptions or business logic needs to be explained

```ts
// ❓ What is happening here?
const a = b + c - d

// ✅ Clear naming & comment
const priceAfterDiscount = basePrice + tax - discount // includes VAT
```

---

## ⚛️ React Conventions

- Prefer `const Component = () => {}`
  > _Why?_ Consistent with modern React patterns and works better with TypeScript

- Always use **named exports**
  > _Why?_ Makes imports explicit and improves tooling support

- Import React hooks directly
  > _Why?_ Reduces verbosity and follows modern React patterns

- Keep components **small and simple**.
- A component is the unit we think in — no distinction between “logic” and “UI” components.
- Use **custom hooks** only when:
  - Logic is reused
  - Component complexity becomes unmanageable

```tsx
// ✅ Keep simple logic inline
const Counter = () => {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}

// ✅ Extract hook only when reused
const useFormErrors = (fields: string[]) => {
  // some reusable logic
}
```

---

## 🎨 Styling Guidelines

- TailwindCSS with class sorting
  > _Why?_ Ensures consistent class order and improves readability

- Never modify Shadcn directly
  > _Why?_ Preserves upgradeability and maintains consistent component behavior

- TailwindCSS v4 with automatic class sorting via Prettier plugin.
- Follow Tailwind’s internal order: layout-related classes first, decorative ones last.
- **Never modify** Shadcn components directly — wrap or extend them instead.
- Custom color palette:

---

## 🧰 Code Style

- Formatting and linting is enforced via Prettier and ESLint
- Follow readable, verbose code style
- Prefer explicit, intention-revealing code over clever hacks

```ts
// ✅ Clear
const hasPermission = user.role === 'admin' || user.permissions.includes('edit')

// 🚫 Too clever
const canEdit = user?.role === 'admin' || user?.permissions?.some(p => p === 'edit')
```

---

## 🔍 Code Reviews

- Check for performance issues (e.g., unnecessary renders, large state updates)
- Validate clear naming and structure
- Favor centralization of shared logic and styling
- Dependencies should help — but keep to a minimum

