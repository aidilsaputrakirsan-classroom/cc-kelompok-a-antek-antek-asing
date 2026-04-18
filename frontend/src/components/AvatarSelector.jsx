import { avatars } from "../constants/avatars";

/**
 * Avatar Selector Component
 * Displays a responsive grid of avatars with selection UI
 * 
 * Props:
 * - selected: currently selected avatar index
 * - onSelect: callback when avatar is selected
 * - loading: disable buttons while loading
 */
export default function AvatarSelector({ selected, onSelect, loading = false }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 md:grid-cols-5 md:gap-4">
        {avatars.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            disabled={loading}
            onClick={() => onSelect(avatar.id)}
            className={`group relative overflow-hidden rounded-xl transition-all duration-200 ${
              loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md"
            }`}
            title={avatar.label}
            aria-label={avatar.label}
            aria-pressed={selected === avatar.id}
          >
            {/* Avatar Image */}
            <img
              src={avatar.src}
              alt={avatar.label}
              className={`aspect-square w-full object-cover transition-all duration-200 ${
                selected === avatar.id ? "scale-105" : "group-hover:scale-105"
              }`}
            />

            {/* Border & Selection Indicator */}
            <div
              className={`absolute inset-0 rounded-xl border-2 transition-all duration-200 ${
                selected === avatar.id
                  ? "border-blue-500 scale-100"
                  : "border-slate-200 dark:border-slate-700 scale-95 group-hover:scale-100 group-hover:border-slate-400 dark:group-hover:border-slate-600"
              }`}
            />

            {/* Check Mark for Selected */}
            {selected === avatar.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 rounded-xl">
                <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Loading State Indicator */}
      {loading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Menyimpan avatar...</p>
      )}
    </div>
  );
}
