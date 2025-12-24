// Local augmentation for react-to-print types to ensure the `content` option
// is available in our TypeScript environment. We pin react-to-print to v2.14.0
// which uses a `content` callback returning the element to print.

declare module "react-to-print" {
  export interface UseReactToPrintOptions {
    /**
     * Callback that returns the DOM node to be printed.
     */
    content?: () => HTMLElement | null;

    /** Optional document title for the printed document */
    documentTitle?: string;

    /** Callback after print */
    onAfterPrint?: () => void;

    /** Callback on print error */
    onPrintError?: (error: Error) => void;

    /** Preserve body after print */
    preserveAfterPrint?: boolean;
  }

  /**
   * Returns a print function. The returned function may be called with an
   * optional content parameter (either a callback that returns an element or
   * the element itself) — this matches runtime behavior across versions.
   */
  export function useReactToPrint(
    options?: UseReactToPrintOptions
  ): (optionalContent?: (() => HTMLElement | null) | HTMLElement | null) => void;
}
