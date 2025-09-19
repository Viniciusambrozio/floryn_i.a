'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, Users } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { UserProfile } from '@/types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface FormErrors {
  name?: string;
  age?: string;
  gender?: string;
}

export default function ProfileModal({ isOpen, onClose, onComplete }: ProfileModalProps) {
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    age: 25,
    gender: 'other'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  
  const { setUserProfile } = useAppStore();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (formData.age && (formData.age < 16 || formData.age > 100)) {
      newErrors.age = 'Idade deve estar entre 16 e 100 anos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setUserProfile(formData);
      onComplete();
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (field in errors && errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof FormErrors]: undefined }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: '#9FB397' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="bg-white backdrop-blur-sm rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-heading text-xl font-bold text-gray-900">
                Conte-nos sobre você
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:opacity-70 rounded-full transition-opacity"
                style={{ color: '#9FB397' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="mb-6 text-sm text-gray-600">
              Essas informações nos ajudam a filtrar os produtos mais adequados para você.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
                  <User className="w-4 h-4" style={{ color: '#9FB397' }} />
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-floryn-primary focus:border-transparent transition-all text-sm text-black ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Como podemos te chamar?"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Idade */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
                  <Calendar className="w-4 h-4" style={{ color: '#9FB397' }} />
                  Idade
                </label>
                <input
                  type="number"
                  min="16"
                  max="100"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 16)}
                  className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-floryn-primary focus:border-transparent transition-all text-sm text-black ${
                    errors.age ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.age && (
                  <p className="text-red-500 text-xs mt-1">{errors.age}</p>
                )}
              </div>

              {/* Sexo */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
                  <Users className="w-4 h-4" style={{ color: '#9FB397' }} />
                  Sexo
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { value: 'male', label: 'Masculino' },
                    { value: 'female', label: 'Feminino' },
                    { value: 'other', label: 'Prefiro não dizer' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInputChange('gender', option.value)}
                      className={`p-2 text-sm rounded-xl border-2 transition-all ${
                        formData.gender === option.value
                          ? 'border-floryn-primary bg-floryn-primary/10 text-black font-medium'
                          : 'border-gray-200 hover:border-floryn-primary/50 text-black'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-floryn-primary hover:bg-floryn-primary-dark text-white font-semibold py-3 rounded-xl transition-colors mt-6"
              >
                Começar Quiz
              </motion.button>
            </form>

            {/* Privacy Notice */}
            <p className="text-xs text-center mt-4 text-gray-500">
              🔒 Seus dados ficam no seu dispositivo e são usados apenas para melhorar as recomendações.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}