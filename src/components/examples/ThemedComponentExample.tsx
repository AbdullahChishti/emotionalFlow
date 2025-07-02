'use client'

import { motion } from 'framer-motion'
import { Heart, Star, Shield } from 'lucide-react'
import { themeClasses, componentClasses, cn } from '@/styles/theme-utils'
import { useColorTheme } from '@/components/providers/ColorThemeProvider'

/**
 * Example component demonstrating how to use the centralized theming system
 * This shows best practices for creating theme-aware components
 */
export function ThemedComponentExample() {
  const { currentTheme, themeData } = useColorTheme()

  return (
    <div className={cn(componentClasses.hero.container, "p-8")}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header with theme info */}
        <div className="text-center">
          <h1 className={cn(componentClasses.hero.title, "mb-4")}>
            Themed Component Example
          </h1>
          <p className={cn(componentClasses.hero.subtitle, "mb-6")}>
            Current theme: <strong>{themeData.name}</strong>
          </p>
          <div className={cn(componentClasses.hero.accent)} />
        </div>

        {/* Typography examples */}
        <section className={cn(componentClasses.card.base, "p-6")}>
          <h2 className={cn(componentClasses.feature.title, "mb-4")}>Typography</h2>
          <div className="space-y-4">
            <h1 className={cn(themeClasses.typography['4xl'], themeClasses.typography.extralight, themeClasses.text.primary)}>
              Heading 1 - Extra Light
            </h1>
            <h2 className={cn(themeClasses.typography['3xl'], themeClasses.typography.light, themeClasses.text.primary)}>
              Heading 2 - Light
            </h2>
            <h3 className={cn(themeClasses.typography['2xl'], themeClasses.typography.normal, themeClasses.text.primary)}>
              Heading 3 - Normal
            </h3>
            <p className={cn(themeClasses.typography.lg, themeClasses.typography.light, themeClasses.text.secondary, themeClasses.typography.relaxed)}>
              Body text - Large, light weight with relaxed line height for comfortable reading.
            </p>
            <p className={cn(themeClasses.typography.base, themeClasses.text.secondary)}>
              Regular body text with normal size and weight.
            </p>
            <p className={cn(themeClasses.typography.sm, themeClasses.text.tertiary, themeClasses.typography.wide)}>
              Caption text - Small, tertiary color with wide letter spacing.
            </p>
          </div>
        </section>

        {/* Button examples */}
        <section className={cn(componentClasses.card.base, "p-6")}>
          <h2 className={cn(componentClasses.feature.title, "mb-4")}>Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className={cn(componentClasses.button.primary, "px-6 py-3")}>
              Primary Button
            </button>
            <button className={cn(componentClasses.button.secondary, "px-6 py-3")}>
              Secondary Button
            </button>
            <button className={cn(componentClasses.button.ghost, "px-6 py-3")}>
              Ghost Button
            </button>
            <button className={cn(
              themeClasses.button.outline,
              themeClasses.radius.full,
              themeClasses.transition.normal,
              "px-6 py-3"
            )}>
              Outline Button
            </button>
          </div>
        </section>

        {/* Color examples */}
        <section className={cn(componentClasses.card.base, "p-6")}>
          <h2 className={cn(componentClasses.feature.title, "mb-4")}>Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className={cn(themeClasses.background.primary, themeClasses.border.primary, "h-16 border rounded-lg")} />
              <p className={cn(themeClasses.typography.sm, themeClasses.text.tertiary)}>Primary Background</p>
            </div>
            <div className="space-y-2">
              <div className={cn(themeClasses.background.secondary, themeClasses.border.primary, "h-16 border rounded-lg")} />
              <p className={cn(themeClasses.typography.sm, themeClasses.text.tertiary)}>Secondary Background</p>
            </div>
            <div className="space-y-2">
              <div className={cn(themeClasses.surface.primary, themeClasses.border.primary, "h-16 border rounded-lg")} />
              <p className={cn(themeClasses.typography.sm, themeClasses.text.tertiary)}>Surface</p>
            </div>
            <div className="space-y-2">
              <div className={cn(themeClasses.surface.elevated, themeClasses.shadow.lg, "h-16 rounded-lg")} />
              <p className={cn(themeClasses.typography.sm, themeClasses.text.tertiary)}>Elevated Surface</p>
            </div>
          </div>
        </section>

        {/* Status colors */}
        <section className={cn(componentClasses.card.base, "p-6")}>
          <h2 className={cn(componentClasses.feature.title, "mb-4")}>Status Colors</h2>
          <div className="space-y-3">
            <div className={cn("flex items-center gap-3")}>
              <div className="w-4 h-4 bg-[var(--color-success)] rounded-full" />
              <span className={cn(themeClasses.status.success, themeClasses.typography.medium)}>Success</span>
            </div>
            <div className={cn("flex items-center gap-3")}>
              <div className="w-4 h-4 bg-[var(--color-warning)] rounded-full" />
              <span className={cn(themeClasses.status.warning, themeClasses.typography.medium)}>Warning</span>
            </div>
            <div className={cn("flex items-center gap-3")}>
              <div className="w-4 h-4 bg-[var(--color-error)] rounded-full" />
              <span className={cn(themeClasses.status.error, themeClasses.typography.medium)}>Error</span>
            </div>
            <div className={cn("flex items-center gap-3")}>
              <div className="w-4 h-4 bg-[var(--color-info)] rounded-full" />
              <span className={cn(themeClasses.status.info, themeClasses.typography.medium)}>Info</span>
            </div>
          </div>
        </section>

        {/* Feature cards example */}
        <section className={cn(componentClasses.card.base, "p-6")}>
          <h2 className={cn(componentClasses.feature.title, "mb-6")}>Feature Cards</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: "Empathy", description: "Connect with genuine understanding" },
              { icon: Star, title: "Excellence", description: "Crafted with attention to detail" },
              { icon: Shield, title: "Safety", description: "Protected and secure environment" }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className={cn(componentClasses.card.elevated, "p-6 text-center")}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className={cn("mb-4 flex justify-center")}>
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    "bg-[var(--color-primary)]/10"
                  )}>
                    <feature.icon className={cn("w-6 h-6", themeClasses.text.primary)} />
                  </div>
                </div>
                <h3 className={cn(themeClasses.typography.xl, themeClasses.typography.medium, themeClasses.text.primary, "mb-2")}>
                  {feature.title}
                </h3>
                <p className={cn(themeClasses.text.secondary, themeClasses.typography.light)}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Spacing examples */}
        <section className={cn(componentClasses.card.base, "p-6")}>
          <h2 className={cn(componentClasses.feature.title, "mb-4")}>Spacing</h2>
          <div className="space-y-4">
            {['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'].map((size) => (
              <div key={size} className="flex items-center gap-4">
                <div className={cn(`w-[var(--spacing-${size})] h-4`, themeClasses.background.primary, themeClasses.border.primary, "border")} />
                <span className={cn(themeClasses.typography.sm, themeClasses.text.tertiary)}>
                  {size}: var(--spacing-{size})
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Border radius examples */}
        <section className={cn(componentClasses.card.base, "p-6")}>
          <h2 className={cn(componentClasses.feature.title, "mb-4")}>Border Radius</h2>
          <div className="flex flex-wrap gap-4">
            {['sm', 'md', 'lg', 'xl', '2xl', 'full'].map((size) => (
              <div key={size} className="text-center">
                <div className={cn(
                  `w-16 h-16 mb-2`,
                  themeClasses.background.primary,
                  themeClasses.border.primary,
                  "border",
                  themeClasses.radius[size as keyof typeof themeClasses.radius]
                )} />
                <span className={cn(themeClasses.typography.sm, themeClasses.text.tertiary)}>
                  {size}
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
