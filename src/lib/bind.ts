"use server";

export function bind<TArgs extends unknown[]>(
  action: (...args: [...TArgs, unknown, FormData]) => Promise<unknown>,
  ...args: TArgs
) {
  return action.bind(null, ...args) as (prevState: unknown, formData: FormData) => Promise<unknown>;
}
