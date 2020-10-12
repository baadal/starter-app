export interface RouteData {
  name?: string;
  path: string;
  component: React.ComponentType<any>;
}

export interface Route {
  name: string;
  path: string;
  exact: boolean;
  component: any;
}
