import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function TabBar({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-4 border-b border-borderwarm pb-4">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "flex items-center gap-2 rounded-t-xl px-5 py-3 text-sm font-medium transition-colors border-b-2",
              isActive 
                ? "bg-bgpanelhover border-borderwarm text-brand-400 font-bold shadow-[0_0_15px_rgba(217,119,87,0.1)]" 
                : "border-transparent text-textmuted hover:bg-bgpanel hover:text-textprimary"
            )}
          >
            {Icon && <Icon size={16} />}
            {tab.label}
          </motion.button>
        )
      })}
    </div>
  )
}
