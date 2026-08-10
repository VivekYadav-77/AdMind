import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-borderwarm bg-bgpanel/50">
      <div className="text-sm text-textmuted">
        Page <span className="font-medium text-textprimary">{page}</span> of <span className="font-medium text-textprimary">{pages}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-2 rounded-xl border border-borderwarm text-textmuted hover:text-textprimary hover:bg-bgpanel disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, Math.min(pages, page + 1)))}
          disabled={page === pages}
          className="p-2 rounded-xl border border-borderwarm text-textmuted hover:text-textprimary hover:bg-bgpanel disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
