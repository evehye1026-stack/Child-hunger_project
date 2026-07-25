// @types/node is pinned to v20, which predates Node's built-in `node:sqlite` module
// (available since Node 22.5, used here on Node 24). Minimal ambient typing for the
// subset of the API this project actually calls.
declare module "node:sqlite" {
  export type SQLInputValue = null | number | bigint | string | Uint8Array;
  export type SQLOutputRow = Record<string, SQLInputValue>;

  export class StatementSync {
    run(...params: SQLInputValue[]): { changes: number; lastInsertRowid: number | bigint };
    get(...params: SQLInputValue[]): SQLOutputRow | undefined;
    all(...params: SQLInputValue[]): SQLOutputRow[];
  }

  export class DatabaseSync {
    constructor(path: string, options?: { readOnly?: boolean });
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
