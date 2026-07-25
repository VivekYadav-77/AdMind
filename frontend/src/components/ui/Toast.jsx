import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import clsx from 'clsx'

export default function Toast({ toast, onRemove }) {
  const { type, message } = toast

  const icons = {
    success: <CheckCircle2 className="text-emerald-400" size={20} />,
    error: <AlertCircle className="text-red-400" size={20} />,
    info: <Info className="text-blue-400" size={20} />
  }

  const styles = {
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    error: "bg-red-500/10 border-red-500/20 text-red-500",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-500"
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={clsx(
        "pointer-events-auto flex items-start gap-3 rounded-2xl p-4 shadow-xl border backdrop-blur-md min-w-[300px] max-w-sm",
        styles[type] || styles.info,
        "bg-bgpanel" // fallback base
      )}
    >
      <div className="shrink-0 mt-0.5">{icons[type] || icons.info}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-textprimary">{message}</p>
      </div>
      <button 
        onClick={onRemove}
        className="shrink-0 text-textmuted hover:text-textprimary transition-colors p-1"
      >
        <X size={16} />
      </button>
    </motion.div>
  )
}
