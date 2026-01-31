/**
 * EXAMPLE: How to properly use React.forwardRef with components
 * Fixes the "Function components cannot be given refs" warning
 */

'use client'

import { forwardRef, useState, useRef, useEffect, ReactNode } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// ============================================================================
// EXAMPLE 1: Basic forwarded component
// ============================================================================

interface CardProps {
  children: ReactNode
  className?: string
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
)

Card.displayName = 'Card'
export { Card }

// ============================================================================
// EXAMPLE 2: Forwarded component with internal ref
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)

Input.displayName = 'Input'
export { Input }

// ============================================================================
// EXAMPLE 3: Complex component with multiple refs
// ============================================================================

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, error, ...props }, ref) => (
    <div>
      <textarea
        className={cn(
          'flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
)

TextArea.displayName = 'TextArea'
export { TextArea }

// ============================================================================
// EXAMPLE 4: Component with ref callback
// ============================================================================

interface ImageLoaderProps {
  src: string
  alt: string
  width: number
  height: number
  onLoad?: () => void
}

const ImageLoader = forwardRef<HTMLDivElement, ImageLoaderProps>(
  ({ src, alt, width, height, onLoad }, ref) => {
    const [loaded, setLoaded] = useState(false)

    return (
      <div
        ref={ref}
        className="relative overflow-hidden bg-gray-100 rounded-lg"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={() => {
            setLoaded(true)
            onLoad?.()
          }}
          className={cn(
            'w-full h-full transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
        />
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}
      </div>
    )
  }
)

ImageLoader.displayName = 'ImageLoader'
export { ImageLoader }

// ============================================================================
// EXAMPLE 5: Usage in parent component
// ============================================================================

export function ComponentUsageExample() {
  // Create refs for the components
  const cardRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  // Now you can access and use these refs
  const handleScrollToCard = () => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFocusInput = () => {
    inputRef.current?.focus()
  }

  const handleGetTextAreaValue = () => {
    const value = textAreaRef.current?.value
    console.log('TextArea value:', value)
  }

  return (
    <div className="space-y-4 p-4">
      <button
        onClick={handleScrollToCard}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Scroll to Card
      </button>

      <Card ref={cardRef} className="p-6">
        <h2 className="text-2xl font-bold mb-4">Example Card</h2>
        <p>This card can be scrolled into view using the ref</p>
      </Card>

      <button
        onClick={handleFocusInput}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Focus Input
      </button>

      <Input
        ref={inputRef}
        placeholder="Click the button above to focus this input"
        type="text"
      />

      <button
        onClick={handleGetTextAreaValue}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Get TextArea Value
      </button>

      <TextArea
        ref={textAreaRef}
        placeholder="Click the button above to get this value"
        error={false}
      />

      <ImageLoader
        ref={imageRef}
        src="/placeholder.jpg"
        alt="Example"
        width={300}
        height={200}
        onLoad={() => console.log('Image loaded')}
      />
    </div>
  )
}

// ============================================================================
// QUICK REFERENCE
// ============================================================================
/*
PATTERN FOR CREATING FORWARDREF COMPONENTS:

1. Define props interface:
   interface MyComponentProps {
     children?: ReactNode
     className?: string
     // ... other props
   }

2. Wrap with forwardRef:
   const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
     ({ children, className, ...props }, ref) => (
       <div ref={ref} className={className}>
         {children}
       </div>
     )
   )

3. Set displayName:
   MyComponent.displayName = 'MyComponent'

4. Export:
   export default MyComponent

5. Use in parent:
   const myRef = useRef<HTMLDivElement>(null)
   <MyComponent ref={myRef} />

KEY RULES:
✅ First generic param = DOM element type (HTMLDivElement, HTMLInputElement, etc)
✅ Second generic param = Component props interface
✅ Always use ref parameter in JSX element
✅ Always set displayName for debugging
✅ Use forwardRef for ANY component that receives a ref prop
❌ Don't pass ref in props
❌ Don't use useRef inside forwardRef for the same element
❌ Don't forget displayName
*/
