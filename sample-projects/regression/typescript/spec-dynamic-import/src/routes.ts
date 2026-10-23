export const routes = [
  { path: 'admin', loadComponent: () => import('./admin').then((m) => m.AdminComponent) },
  { path: 'report', loadComponent: () => import('./report').then(({ ReportComponent }) => ReportComponent) },
]

export async function loadStats(): Promise<unknown> {
  return (await import('./stats')).Stats
}
