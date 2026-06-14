export function DashboardHeader() {
  return (
    <header className="border-b border-stone-200 bg-white/80 px-5 py-4 backdrop-blur dark:border-stone-800 dark:bg-stone-950/80 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
            Workspace
          </p>
          <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">
            Content operations
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <label
            className="text-sm font-medium text-stone-600 dark:text-stone-300"
            htmlFor="brand-switcher"
          >
            Brand
          </label>
          <select
            className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-900 shadow-sm outline-none focus:border-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            defaultValue="basarai-demo"
            id="brand-switcher"
          >
            <option value="basarai-demo">Basarai Demo Brand</option>
          </select>
        </div>
      </div>
    </header>
  );
}
