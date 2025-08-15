
export function StoryLoader() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* floating glass card */}
        <div className="relative w-72 h-40 rounded-3xl bg-gradient-to-br from-rose-500/10 via-indigo-500/10 to-indigo-600/10 animate-pulse">
          <div className="absolute inset-0 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm rounded-3xl" />
        </div>

        {/* text typing illusion */}
        <div className="text-slate-600 dark:text-slate-300">
          <p>Gathering imaginations…</p>
          <div className="mt-2 w-24 h-1 bg-indigo-500 rounded-full mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default StoryLoader; 