declare module 'epubjs' {
  interface RenditionOptions {
    width?: string | number
    height?: string | number
    flow?: string
    spread?: string
  }
  interface Rendition {
    display(target?: string | number): Promise<void>
    on(event: string, callback: (...args: unknown[]) => void): void
    prev(): Promise<void>
    next(): Promise<void>
    destroy(): void
    themes: {
      default(values: Record<string, string>): void
      override(name: string, value: string): void
    }
  }
  interface Book {
    ready: Promise<unknown>
    loaded: Record<string, Promise<unknown>>
    renderTo(element: HTMLElement | string, options: RenditionOptions): Rendition
    destroy(): void
  }
  export default function ePub(src: ArrayBuffer | string): Book
}
