/* tslint:disable */
/* eslint-disable */
export function main(): void;
/**
 * Entry point for web workers
 */
export function wasm_thread_entry_point(ptr: number): Promise<void>;
/**
 * The `ReadableStreamType` enum.
 *
 * *This API requires the following crate features to be activated: `ReadableStreamType`*
 */
type ReadableStreamType = "bytes";
export class Application {
  private constructor();
  free(): void;
  /**
   * Performs a query against an application's service.
   *
   * # Errors
   * If the application ID is invalid, the query is incorrect, or
   * the response isn't valid UTF-8.
   *
   * # Panics
   * On internal protocol errors.
   */
  query(query: string): Promise<string>;
}
/**
 * The full client API, exposed to the wallet implementation. Calls
 * to this API can be trusted to have originated from the user's
 * request. This struct is the backend for the extension itself
 * (side panel, option page, et cetera).
 */
export class Client {
  free(): void;
  /**
   * Creates a new client and connects to the network.
   *
   * # Errors
   * On transport or protocol error, or if persistent storage is
   * unavailable.
   */
  constructor(wallet: Wallet);
  /**
   * Sets a callback to be called when a notification is received
   * from the network.
   *
   * # Panics
   * If the handler function fails or we fail to subscribe to the
   * notification stream.
   */
  onNotification(handler: Function): void;
  /**
   * Transfers funds from one account to another.
   *
   * `options` should be an options object of the form `{ donor,
   * recipient, amount }`; omitting `donor` will cause the funds to
   * come from the chain balance.
   *
   * # Errors
   * - if the options object is of the wrong form
   * - if the transfer fails
   */
  transfer(options: any): Promise<void>;
  /**
   * Gets the identity of the default chain.
   *
   * # Errors
   * If the chain couldn't be established.
   */
  identity(): Promise<any>;
  /**
   * Gets an object implementing the API for Web frontends.
   */
  frontend(): Frontend;
}
export class Faucet {
  free(): void;
  constructor(url: string);
  /**
   * Creates a new wallet from the faucet.
   *
   * # Errors
   * If we couldn't retrieve the genesis config from the faucet.
   */
  createWallet(): Promise<Wallet>;
  /**
   * Claims a new chain from the faucet, with a new keypair and some tokens.
   *
   * # Errors
   * - if we fail to get the list of current validators from the faucet
   * - if we fail to claim the chain from the faucet
   * - if we fail to persist the new chain or keypair to the wallet
   *
   * # Panics
   * If an error occurs in the chain listener task.
   */
  claimChain(client: Client): Promise<string>;
}
/**
 * The subset of the client API that should be exposed to application
 * frontends. Any function exported here with `wasm_bindgen` can be
 * called by untrusted Web pages, and so inputs must be verified and
 * outputs must not leak sensitive information without user
 * confirmation.
 */
export class Frontend {
  private constructor();
  free(): void;
  /**
   * Gets the version information of the validators of the current network.
   *
   * # Errors
   * If a validator is unreachable.
   *
   * # Panics
   * If no default chain is set for the current wallet.
   */
  validatorVersionInfo(): Promise<any>;
  /**
   * Retrieves an application for querying.
   *
   * # Errors
   * If the application ID is invalid.
   */
  application(id: string): Promise<Application>;
}
export class IntoUnderlyingByteSource {
  private constructor();
  free(): void;
  start(controller: ReadableByteStreamController): void;
  pull(controller: ReadableByteStreamController): Promise<any>;
  cancel(): void;
  readonly type: ReadableStreamType;
  readonly autoAllocateChunkSize: number;
}
export class IntoUnderlyingSink {
  private constructor();
  free(): void;
  write(chunk: any): Promise<any>;
  close(): Promise<any>;
  abort(reason: any): Promise<any>;
}
export class IntoUnderlyingSource {
  private constructor();
  free(): void;
  pull(controller: ReadableStreamDefaultController): Promise<any>;
  cancel(): void;
}
export class Wallet {
  private constructor();
  free(): void;
  /**
   * Creates and persists a new wallet from the given JSON string.
   *
   * # Errors
   * If the wallet deserialization fails.
   */
  static fromJson(wallet: string): Promise<Wallet>;
  /**
   * Attempts to read the wallet from persistent storage.
   *
   * # Errors
   * If storage is inaccessible.
   */
  static read(): Promise<Wallet | undefined>;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly __wbg_wallet_free: (a: number, b: number) => void;
  readonly __wbg_faucet_free: (a: number, b: number) => void;
  readonly faucet_new: (a: number, b: number) => number;
  readonly faucet_createWallet: (a: number) => any;
  readonly faucet_claimChain: (a: number, b: number) => any;
  readonly wallet_fromJson: (a: number, b: number) => any;
  readonly wallet_read: () => any;
  readonly __wbg_client_free: (a: number, b: number) => void;
  readonly __wbg_frontend_free: (a: number, b: number) => void;
  readonly client_new: (a: number) => any;
  readonly client_onNotification: (a: number, b: any) => void;
  readonly client_transfer: (a: number, b: any) => any;
  readonly client_identity: (a: number) => any;
  readonly client_frontend: (a: number) => number;
  readonly __wbg_application_free: (a: number, b: number) => void;
  readonly frontend_validatorVersionInfo: (a: number) => any;
  readonly frontend_application: (a: number, b: number, c: number) => any;
  readonly application_query: (a: number, b: number, c: number) => any;
  readonly main: () => void;
  readonly wasm_thread_entry_point: (a: number) => any;
  readonly __wbg_intounderlyingbytesource_free: (a: number, b: number) => void;
  readonly intounderlyingbytesource_type: (a: number) => number;
  readonly intounderlyingbytesource_autoAllocateChunkSize: (a: number) => number;
  readonly intounderlyingbytesource_start: (a: number, b: any) => void;
  readonly intounderlyingbytesource_pull: (a: number, b: any) => any;
  readonly intounderlyingbytesource_cancel: (a: number) => void;
  readonly __wbg_intounderlyingsource_free: (a: number, b: number) => void;
  readonly intounderlyingsource_pull: (a: number, b: any) => any;
  readonly intounderlyingsource_cancel: (a: number) => void;
  readonly __wbg_intounderlyingsink_free: (a: number, b: number) => void;
  readonly intounderlyingsink_write: (a: number, b: any) => any;
  readonly intounderlyingsink_close: (a: number) => any;
  readonly intounderlyingsink_abort: (a: number, b: any) => any;
  readonly __wbg_trap_free: (a: number, b: number) => void;
  readonly trap___wbg_wasmer_trap: () => void;
  readonly memory: WebAssembly.Memory;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_5: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_7: WebAssembly.Table;
  readonly closure417_externref_shim_multivalue_shim: (a: number, b: number, c: any) => [number, number];
  readonly __externref_table_dealloc: (a: number) => void;
  readonly closure2766_externref_shim: (a: number, b: number, c: any) => void;
  readonly closure2857_externref_shim: (a: number, b: number, c: any) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h339ca900ce274b47: (a: number, b: number) => void;
  readonly closure3435_externref_shim: (a: number, b: number, c: any, d: any) => void;
  readonly __wbindgen_thread_destroy: (a?: number, b?: number, c?: number) => void;
  readonly __wbindgen_start: (a: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput, memory?: WebAssembly.Memory, thread_stack_size?: number }} module - Passing `SyncInitInput` directly is deprecated.
* @param {WebAssembly.Memory} memory - Deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput, memory?: WebAssembly.Memory, thread_stack_size?: number } | SyncInitInput, memory?: WebAssembly.Memory): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput>, memory?: WebAssembly.Memory, thread_stack_size?: number }} module_or_path - Passing `InitInput` directly is deprecated.
* @param {WebAssembly.Memory} memory - Deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput>, memory?: WebAssembly.Memory, thread_stack_size?: number } | InitInput | Promise<InitInput>, memory?: WebAssembly.Memory): Promise<InitOutput>;
