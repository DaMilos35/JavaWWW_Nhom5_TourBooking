# TourBooking Design System (Source of Truth)
> Powered by UI-UX Pro Max Design Intelligence (`nextlevelbuilder/ui-ux-pro-max-skill`)

---

## 1. Product Profile
- **Industry & Domain:** Travel, Tourism & Vacation Package Booking
- **Archetype / Style:** Aurora UI + Frosted Glassmorphism + Motion-Driven Bento Grid
- **Primary Mood:** Inspiring, Vibrant, Trustworthy, Ultra-Modern (Traveloka / Apple Quality)
- **Target Accessibility:** WCAG AAA (Contrast ratio $\ge 4.5:1$ for body text, $\ge 7:1$ for key titles)

---

## 2. Color Palette & Semantic Tokens

| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `--color-primary` / `--accent-blue` | `#0194F3` (Sky Blue) | Brand identity, primary links, active badges, focus rings |
| `--color-primary-hover` | `#0076C7` | Hover state for primary actions |
| `--color-accent` / `--accent-orange` | `#FF5E1F` (Adventure Orange) | Primary CTA buttons, flash deals, urgent highlights |
| `--color-accent-hover` | `#E04F14` | Hover state for accent buttons |
| `--color-background` / `--bg-main` | `#F8FAFC` (Slate 50) | Main viewport canvas, clean and glare-free |
| `--color-card` / `--bg-surface` | `#FFFFFF` (Crisp Pure White) | Card surfaces, interactive containers |
| `--color-card-hover` | `#F1F5F9` (Slate 100) | Subtle hover surface background |
| `--color-foreground` / `--text-pure` | `#0F172A` (Slate 900 Navy) | Highest emphasis headlines & price numbers |
| `--color-text-primary` | `#1E293B` (Slate 800) | Body copy, labels, primary metadata |
| `--color-muted-foreground` | `#64748B` (Slate 500) | Subtitles, helper text, secondary counters |
| `--color-border` / `--border-subtle` | `#E2E8F0` (Slate 200) | Divider lines, card borders, subtle bounding |
| `--color-destructive` | `#DC2626` | Sold out status, error messages, cancel actions |
| `--color-success` | `#10B981` | Instant confirmation, confirmed bookings, live status |
| `--glass-bg` | `rgba(255, 255, 255, 0.88)` | Frosted glass surfaces |
| `--glass-border` | `rgba(255, 255, 255, 0.6)` | Translucent borders on glass layers |

---

## 3. Typography Rhythm
- **Primary Font Family:** `'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Scale:**
  - Hero Display Title: `clamp(2.2rem, 4vw, 3.2rem)`, weight `800`, line-height `1.2`
  - Section Title: `1.85rem` (`29.6px`), weight `700`, line-height `1.3`
  - Card Title: `1.05rem` (`16.8px`), weight `650`, line-height `1.4`
  - Body Text: `0.95rem` (`15.2px`), weight `400` / `500`, line-height `1.6`
  - Badges & Chips: `0.75rem` (`12px`), weight `600` / `700`, letter-spacing `0.02em`

---

## 4. Spacing Scale & Rhythm (8dp System)
- `4px` (`--space-xs`): Icon-to-label gaps, chip inner padding
- `8px` (`--space-sm`): Card element stacking, pill margins
- `16px` (`--space-md`): Standard card padding, input padding
- `24px` (`--space-lg`): Grid gaps, card separators
- `32px` (`--space-xl`): Section interior headers
- `48px` - `64px` (`--space-2xl`): Major section vertical gutters

---

## 5. Micro-Interactions & Animation Guidelines
1. **Interactive Lift:**
   - Cards elevate on hover: `transform: translateY(-4px);`
   - Shadow bloom: `box-shadow: 0 16px 32px -6px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(1, 148, 243, 0.08);`
   - Transition duration: `220ms cubic-bezier(0.16, 1, 0.3, 1)`
2. **Tactile Button Press:**
   - Active state feedback: `:active { transform: scale(0.98); }`
3. **Cursor Semantics:**
   - `cursor: pointer` applied across all clickable cards, pills, buttons, and custom selects.
4. **SVG Icon Discipline:**
   - No emojis as primary icons. All iconography uses SVG components (`react-icons`).
5. **Focus Rings (Accessibility):**
   - `:focus-visible { outline: 2px solid var(--accent-blue); outline-offset: 2px; }`
6. **Reduced Motion:**
   - When `@media (prefers-reduced-motion: reduce)` is active, animations are replaced with static readable states.
