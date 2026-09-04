import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Info } from 'lucide-react'

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  type = "danger" 
}) {
  const isDanger = type === 'danger';
  const isWarning = type === 'warning';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="w-full max-w-md pointer-events-auto bg-bgpanel border border-borderwarm rounded-3xl shadow-2xl overflow-hidden relative"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full shrink-0 ${isDanger ? 'bg-red-500/10 text-red-500' : isWarning ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {isDanger || isWarning ? <AlertTriangle size={24} /> : <Info size={24} />}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-bold text-textprimary mb-2">{title}</h3>
                    <p className="text-textmuted text-sm leading-relaxed">{message}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 -mr-2 -mt-2 rounded-xl hover:bg-bgpanelhover text-textmuted hover:text-textprimary transition-colors shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl font-medium text-textprimary hover:bg-bgpanelhover transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`px-4 py-2 rounded-xl font-medium text-white transition-colors ${
                    isDanger 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : isWarning
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-brand-600 hover:bg-brand-700'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
