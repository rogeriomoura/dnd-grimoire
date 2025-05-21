declare module '*/package.json' {
  interface PackageJson {
    name: string;
    version: string;
    private: boolean;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    [key: string]: any;
  }

  const value: PackageJson;
  export default value;
}
