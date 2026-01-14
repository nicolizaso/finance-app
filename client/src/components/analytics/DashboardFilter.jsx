const DashboardFilter = ({ currentFilter, onFilterChange }) => {
    const filters = [
        { id: 'thisMonth', label: 'Este Mes' },
        { id: 'lastMonth', label: 'Mes Pasado' },
        { id: 'thisYear', label: 'Este Año' },
    ];

    return (
        <div className="flex bg-surfaceHighlight rounded-lg p-1 gap-1">
            {filters.map(f => (
                <button
                    key={f.id}
                    onClick={() => onFilterChange(f.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        currentFilter === f.id
                        ? 'bg-primary text-white shadow-lg'
                        : 'text-textMuted hover:text-white hover:bg-white/5'
                    }`}
                >
                    {f.label}
                </button>
            ))}
        </div>
    );
};

export default DashboardFilter;
