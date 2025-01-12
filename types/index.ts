export enum Framework {
  NEXTJS = 'nextjs',
  SVELTEKIT = 'sveltekit',
  None = 'none'
}

export type TreeRoot = { name: string, children: { name: string, children: [] }[] }

export type FrameworkConfig = {
  /*
   * Framework name
   */
  name: string
  /*
   * A unique file used to detect the framework
   */
  detectFile: string
  /*
   * Dir where pages or routes are stored
   */
  pageDir: string
  /*
   * Specific file name that represents a route
   */
  pageFileName: string
  /*
   * Function to generate the load template
   */
  loadTemplate: (isTS: boolean) => string
  /*
   * Function to generate the page template
   */
  pageTemplate: (isTS: boolean) => string

}
