/**
 * Loading Skeleton Components
 * Provides consistent loading states throughout the application
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
  animate?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = true,
  animate = true
}) => {
  const baseClasses = 'bg-zinc-200 dark:bg-zinc-700'
  const roundedClasses = rounded ? 'rounded' : ''
  const animateClasses = animate ? 'animate-pulse' : ''

  return (
    <div
      className={`${baseClasses} ${roundedClasses} ${animateClasses} ${className}`}
      style={{ width, height }}
    />
  )
}

export const SkeletonText: React.FC<{
  lines?: number
  className?: string
}> = ({ lines = 1, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="0.75rem"
          width={index === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  )
}

export const SkeletonCard: React.FC<{
  className?: string
  showAvatar?: boolean
  showActions?: boolean
}> = ({ className = '', showAvatar = false, showActions = false }) => {
  return (
    <div className={`p-6 bg-white rounded-2xl shadow-lg border border-zinc-200 ${className}`}>
      <div className="flex items-start space-x-4">
        {showAvatar && (
          <Skeleton width="3rem" height="3rem" className="rounded-full flex-shrink-0" />
        )}
        <div className="flex-1 space-y-3">
          <SkeletonText lines={2} />
          <SkeletonText lines={1} className="w-3/4" />
          {showActions && (
            <div className="flex space-x-2 pt-2">
              <Skeleton width="4rem" height="2rem" />
              <Skeleton width="4rem" height="2rem" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const SkeletonAssessmentCard: React.FC<{
  className?: string
}> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg border border-zinc-200 ${className}`}>
      <div className="text-center space-y-4">
        {/* Icon skeleton */}
        <Skeleton width="4rem" height="4rem" className="rounded-full mx-auto" />
        
        {/* Title skeleton */}
        <Skeleton width="8rem" height="1.5rem" className="mx-auto" />
        
        {/* Description skeleton */}
        <SkeletonText lines={2} className="text-center" />
        
        {/* Button skeleton */}
        <Skeleton width="6rem" height="2.5rem" className="mx-auto rounded-lg" />
      </div>
    </div>
  )
}

export const SkeletonMessage: React.FC<{
  isUser?: boolean
  className?: string
}> = ({ isUser = false, className = '' }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 ${className}`}>
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`p-4 rounded-2xl ${
          isUser 
            ? 'bg-brand-green-500 text-white' 
            : 'bg-white border border-zinc-200'
        }`}>
          <SkeletonText lines={2} className={isUser ? 'bg-white/20' : ''} />
        </div>
        <Skeleton width="3rem" height="0.75rem" className="mt-1" />
      </div>
    </div>
  )
}

export const SkeletonDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="text-center space-y-4">
        <Skeleton width="12rem" height="2rem" className="mx-auto" />
        <Skeleton width="20rem" height="1rem" className="mx-auto" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-zinc-200">
            <div className="text-center space-y-3">
              <Skeleton width="3rem" height="3rem" className="rounded-full mx-auto" />
              <Skeleton width="4rem" height="1.25rem" className="mx-auto" />
              <Skeleton width="6rem" height="1rem" className="mx-auto" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity skeleton */}
      <div className="space-y-4">
        <Skeleton width="8rem" height="1.5rem" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} showAvatar showActions />
          ))}
        </div>
      </div>
    </div>
  )
}

export const SkeletonAssessmentFlow: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="text-center space-y-4">
        <Skeleton width="16rem" height="2.5rem" className="mx-auto" />
        <Skeleton width="24rem" height="1.25rem" className="mx-auto" />
        <Skeleton width="8rem" height="2rem" className="mx-auto rounded-full" />
      </div>

      {/* Assessment cards skeleton */}
      <div className="grid md:grid-cols-2 gap-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonAssessmentCard key={index} />
        ))}
      </div>
    </div>
  )
}

export const SkeletonChat: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Chat header skeleton */}
      <div className="p-4 border-b border-zinc-200">
        <div className="flex items-center space-x-3">
          <Skeleton width="2.5rem" height="2.5rem" className="rounded-full" />
          <div className="space-y-1">
            <Skeleton width="6rem" height="1rem" />
            <Skeleton width="4rem" height="0.75rem" />
          </div>
        </div>
      </div>

      {/* Messages skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonMessage key={index} isUser={index % 2 === 0} />
        ))}
      </div>

      {/* Input skeleton */}
      <div className="p-4 border-t border-zinc-200">
        <div className="flex space-x-2">
          <Skeleton width="100%" height="2.5rem" className="rounded-full" />
          <Skeleton width="2.5rem" height="2.5rem" className="rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Animated skeleton with shimmer effect
export const ShimmerSkeleton: React.FC<SkeletonProps> = (props) => {
  return (
    <motion.div
      className="relative overflow-hidden"
      style={{ width: props.width, height: props.height }}
    >
      <Skeleton {...props} animate={false} />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </motion.div>
  )
}

export default Skeleton
