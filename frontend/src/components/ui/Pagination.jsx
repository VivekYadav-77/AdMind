import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export default function Pagination({ 
  page, 
  pages, 
  total, 
  onPageChange, 
  pageSize, 
  onPageSizeChange 
}) {
  // If no data and no pages, still render structure but empty state or disabled
  const safePage = page || 1;
  const safePages = pages || 1;
  
  // Calculate range of page numbers to show
  const getPageNumbers = () => {
    const nums = [];
    const maxVisible = 5;
    
    if (safePages <= maxVisible) {
      for (let i = 1; i <= safePages; i++) nums.push(i);
    } else {
      if (safePage <= 3) {
        nums.push(1, 2, 3, 4, '...', safePages);
      } else if (safePage >= safePages - 2) {
        nums.push(1, '...', safePages - 3, safePages - 2, safePages - 1, safePages);
      } else {
        nums.push(1, '...', safePage - 1, safePage, safePage + 1, '...', safePages);
      }
    }
    return nums;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-borderwarm bg-bgpanel/50 gap-4">
      <div className="flex items-center gap-4">
        {onPageSizeChange && (
          <div className="flex items-center gap-2 text-sm text-textmuted">
            <span>Show:</span>
            <select
              value={pageSize || 20}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-bgpanel border border-borderwarm rounded-lg px-2 py-1 focus:outline-none focus:border-brand-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
        {total !== undefined && (
          <div className="text-sm text-textmuted">
            Total results: <span className="font-medium text-textprimary">{total}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={safePage === 1}
          className="p-2 rounded-xl border border-transparent text-textmuted hover:text-textprimary hover:bg-bgpanel disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="First Page"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          className="p-2 rounded-xl border border-transparent text-textmuted hover:text-textprimary hover:bg-bgpanel disabled:opacity-50 disabled:cursor-not-allowed transition-colors mr-2"
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>
        
        {getPageNumbers().map((num, i) => (
          num === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-textmuted">...</span>
          ) : (
            <button
              key={`page-${num}`}
              onClick={() => onPageChange(num)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${
                safePage === num
                  ? 'bg-brand-500 text-white font-medium'
                  : 'text-textmuted hover:bg-bgpanel hover:text-textprimary'
              }`}
            >
              {num}
            </button>
          )
        ))}

        <button
          onClick={() => onPageChange(Math.min(safePages, safePage + 1))}
          disabled={safePage === safePages || safePages === 0}
          className="p-2 rounded-xl border border-transparent text-textmuted hover:text-textprimary hover:bg-bgpanel disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-2"
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onPageChange(safePages)}
          disabled={safePage === safePages || safePages === 0}
          className="p-2 rounded-xl border border-transparent text-textmuted hover:text-textprimary hover:bg-bgpanel disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Last Page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  )
}
