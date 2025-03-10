import { useState } from 'react';
import { motion } from 'framer-motion';
import { SiOpenai, SiGoogle } from 'react-icons/si';

type Model = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
};

interface ModelSelectorProps {
  onModelChange: (modelId: string) => void;
  currentModel: string;
}

export function ModelSelector({ onModelChange, currentModel }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const models: Model[] = [
    {
      id: 'gpt-4o',
      name: 'ChatGPT',
      icon: <SiOpenai size={22} className="text-green-400" />,
      description: 'GPT-4o - Advanced reasoning, coding, and creative text capabilities'
    },
    {
      id: 'gemini-pro',
      name: 'Gemini',
      icon: <SiGoogle size={22} className="text-blue-400" />,
      description: 'Gemini Pro - Google\'s multimodal AI with balanced performance'
    }
  ];

  const currentModelObj = models.find(m => m.id === currentModel) || models[0];

  return (
    <div className="relative">
      <button
        className="glass-card p-2 rounded-lg flex items-center gap-2 transition-all hover:bg-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentModelObj.icon}
        <span className="text-sm font-medium">{currentModelObj.name}</span>
        <motion.i 
          className="ri-arrow-down-s-line text-gray-400" 
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </button>

      {isOpen && (
        <motion.div 
          className="absolute left-0 top-full mt-2 w-[280px] glass-effect rounded-lg overflow-hidden z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-2 space-y-1">
            {models.map(model => (
              <div
                key={model.id}
                className={`model-selector p-3 rounded-lg cursor-pointer ${model.id === currentModel ? 'active' : ''}`}
                onClick={() => {
                  onModelChange(model.id);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  {model.icon}
                  <span className="font-medium">{model.name}</span>
                  {model.id === currentModel && (
                    <motion.i 
                      className="ri-check-line ml-auto text-primary" 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{model.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}