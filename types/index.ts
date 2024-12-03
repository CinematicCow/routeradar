export enum Framework {
  NEXTJS = 'nextjs',
  SVELTEKIT = 'sveltekit',
  None = 'none'
}

export type TreeRoot = { name: string, children: { name: string, children: [] }[] }
