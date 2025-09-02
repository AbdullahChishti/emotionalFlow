/**
 * Therapeutic Icon Components
 * Material Symbols integration with accessibility and therapeutic styling
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface IconProps {
  icon: string
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  'aria-hidden'?: boolean
  'aria-label'?: string
}

const sizeMap = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
}

export function MaterialSymbolsOutlined({
  icon,
  className = '',
  size = 'md',
  color = 'currentColor',
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel
}: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${sizeMap[size]} ${className}`}
      style={{ color }}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
    >
      {icon}
    </span>
  )
}

// Therapeutic-specific icon components
export function TherapeuticIcon({
  name,
  ...props
}: Omit<IconProps, 'icon'> & { name: TherapeuticIconName }) {
  const iconMap: Record<TherapeuticIconName, string> = {
    heart: 'favorite',
    calm: 'spa',
    support: 'psychology',
    emergency: 'emergency',
    pause: 'pause_circle',
    play: 'play_circle',
    end: 'logout',
    message: 'chat',
    time: 'schedule',
    user: 'person',
    users: 'group',
    settings: 'settings',
    help: 'help',
    close: 'close',
    check: 'check_circle',
    warning: 'warning',
    info: 'info',
    star: 'star',
    bookmark: 'bookmark',
    share: 'share',
    save: 'save',
    edit: 'edit',
    delete: 'delete',
    add: 'add',
    remove: 'remove',
    expand: 'expand_more',
    collapse: 'expand_less',
    menu: 'menu',
    search: 'search',
    filter: 'filter_list',
    sort: 'sort',
    refresh: 'refresh',
    download: 'download',
    upload: 'upload',
    link: 'link',
    copy: 'content_copy',
    cut: 'content_cut',
    paste: 'content_paste',
    undo: 'undo',
    redo: 'redo',
    home: 'home',
    back: 'arrow_back',
    forward: 'arrow_forward',
    up: 'arrow_up',
    down: 'arrow_down',
    left: 'arrow_left',
    right: 'arrow_right'
  }

  return (
    <MaterialSymbolsOutlined
      icon={iconMap[name]}
      {...props}
    />
  )
}

export type TherapeuticIconName =
  | 'heart'
  | 'calm'
  | 'support'
  | 'emergency'
  | 'pause'
  | 'play'
  | 'end'
  | 'message'
  | 'time'
  | 'user'
  | 'users'
  | 'settings'
  | 'help'
  | 'close'
  | 'check'
  | 'warning'
  | 'info'
  | 'star'
  | 'bookmark'
  | 'share'
  | 'save'
  | 'edit'
  | 'delete'
  | 'add'
  | 'remove'
  | 'expand'
  | 'collapse'
  | 'menu'
  | 'search'
  | 'filter'
  | 'sort'
  | 'refresh'
  | 'download'
  | 'upload'
  | 'link'
  | 'copy'
  | 'cut'
  | 'paste'
  | 'undo'
  | 'redo'
  | 'home'
  | 'back'
  | 'forward'
  | 'up'
  | 'down'
  | 'left'
  | 'right'

// Animated therapeutic icons
export function AnimatedTherapeuticIcon({
  name,
  animation = 'pulse',
  ...props
}: Omit<IconProps, 'icon'> & {
  name: TherapeuticIconName
  animation?: 'pulse' | 'bounce' | 'spin' | 'heartbeat'
}) {
  const animationVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity
      }
    },
    bounce: {
      y: [0, -4, 0],
      transition: {
        duration: 1,
        repeat: Infinity
      }
    },
    spin: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity
      }
    },
    heartbeat: {
      scale: [1, 1.2, 1, 1.2, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        times: [0, 0.2, 0.4, 0.6, 1]
      }
    }
  }

  return (
    <motion.span
      animate={animationVariants[animation]}
      className="inline-block"
    >
      <TherapeuticIcon name={name} {...props} />
    </motion.span>
  )
}

// Status indicator icons
export function StatusIcon({
  status,
  size = 'sm',
  ...props
}: Omit<IconProps, 'icon' | 'size'> & {
  status: 'online' | 'offline' | 'away' | 'busy' | 'error'
  size?: IconProps['size']
}) {
  const statusConfig = {
    online: { icon: 'circle', color: '#10b981' },
    offline: { icon: 'circle', color: '#6b7280' },
    away: { icon: 'circle', color: '#f59e0b' },
    busy: { icon: 'circle', color: '#ef4444' },
    error: { icon: 'error', color: '#ef4444' }
  }

  const config = statusConfig[status]

  return (
    <MaterialSymbolsOutlined
      icon={config.icon}
      size={size}
      color={config.color}
      {...props}
    />
  )
}

// Emotional state icons
export function EmotionalIcon({
  emotion,
  size = 'md',
  ...props
}: Omit<IconProps, 'icon' | 'size'> & {
  emotion: 'happy' | 'sad' | 'angry' | 'anxious' | 'calm' | 'excited' | 'neutral'
  size?: IconProps['size']
}) {
  const emotionMap = {
    happy: 'sentiment_very_satisfied',
    sad: 'sentiment_dissatisfied',
    angry: 'sentiment_very_dissatisfied',
    anxious: 'sentiment_neutral',
    calm: 'spa',
    excited: 'celebration',
    neutral: 'sentiment_satisfied'
  }

  return (
    <MaterialSymbolsOutlined
      icon={emotionMap[emotion]}
      size={size}
      {...props}
    />
  )
}
