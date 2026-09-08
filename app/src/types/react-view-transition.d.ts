import 'react'

/**
 * `<ViewTransition>` ships in the React canary that the Next 16 App Router
 * aliases `react` to at build time, so it exists at runtime with no config.
 * The published @types/react are the stable 19.x ones and do not declare it
 * yet, so it is declared here rather than reached for through `any`.
 *
 * Delete this file once @types/react carries the definition.
 */
declare module 'react' {
  interface ViewTransitionProps {
    children?: import('react').ReactNode
    /** Shared name. Two elements with the same name morph into each other. */
    name?: string
    /** Class applied for every kind of transition. */
    default?: string
    enter?: string
    exit?: string
    update?: string
    share?: string
  }

  export const ViewTransition: import('react').ComponentType<ViewTransitionProps>
}
