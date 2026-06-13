declare module 'xlsx' {
  export type Sheet = Record<string, unknown>;
  export type WorkBook = {
    SheetNames: string[];
    Sheets: Record<string, Sheet>;
  };

  export function read(data: ArrayBuffer, options: { type: 'array' }): WorkBook;

  export namespace utils {
    function sheet_to_json<T>(sheet: Sheet, options: { defval?: unknown; raw?: boolean; header: 1 }): T[];
  }
}
