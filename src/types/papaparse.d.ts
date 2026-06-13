declare module 'papaparse' {
  export type ParseError = {
    type?: string;
    code?: string;
    message: string;
  };

  export type ParseResult<T> = {
    data: T[];
    errors: ParseError[];
  };

  export type ParseConfig<T> = {
    header?: boolean;
    skipEmptyLines?: boolean | 'greedy';
    transformHeader?: (header: string, index: number) => string;
    complete?: (results: ParseResult<T>) => void;
    error?: (error: Error) => void;
  };

  export function parse<T>(file: File, config: ParseConfig<T>): void;

  const Papa: {
    parse: typeof parse;
  };

  export default Papa;
}
