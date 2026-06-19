import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus } from 'lucide-react';
import { MenuItem } from '../types.ts';

interface CustomizerModalProps {
  selectedProduct: MenuItem | null;
  setSelectedProduct: (val: MenuItem | null) => void;
  customTemp: 'Hot' | 'Iced' | 'Normal';
  setCustomTemp: (val: 'Hot' | 'Iced' | 'Normal') => void;
  customSugar: 'No Sugar' | 'Less Sugar' | 'Normal' | 'Extra Sugar';
  setCustomSugar: (val: 'No Sugar' | 'Less Sugar' | 'Normal' | 'Extra Sugar') => void;
  customNotes: string;
  setCustomNotes: (val: string) => void;
  customQty: number;
  setCustomQty: React.Dispatch<React.SetStateAction<number>>;
  handleAddToCart: () => void;
}

export default function CustomizerModal({
  selectedProduct,
  setSelectedProduct,
  customTemp,
  setCustomTemp,
  customSugar,
  setCustomSugar,
  customNotes,
  setCustomNotes,
  customQty,
  setCustomQty,
  handleAddToCart
}: CustomizerModalProps) {
  if (!selectedProduct) return null;

  const isBeverage = selectedProduct.category === 'coffee' || selectedProduct.category === 'non-coffee';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedProduct(null)}
          className="fixed inset-0 bg-[#2B1E17]/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Window panel */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-[#FAF6F0] border border-[#D2C7BA]/50 max-w-md w-full rounded-3xl p-6 relative z-10 shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex justify-between items-start pb-4 border-b border-[#2B1E17]/10">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-[#4A533C] uppercase font-bold bg-[#4A533C]/10 px-2.5 py-0.5 rounded-full">
                Customise Order
              </span>
              <h3 className="font-serif text-xl font-bold text-[#2B1E17] mt-1 pr-6 leading-tight">
                {selectedProduct.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedProduct(null)}
              className="p-1 rounded-full border border-[#2B1E17]/10 text-[#2B1E17] hover:bg-[#2B1E17]/5 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Options content */}
          <div className="space-y-5 py-4 flex-1 text-sm text-[#2B1E17]">
            {isBeverage && (
              <>
                {/* Temperature mode option */}
                <div className="space-y-2">
                  <label className="font-semibold block text-xs tracking-wide text-[#4A533C] uppercase">
                    Pilih Suasana (Suhu)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedProduct.isHotAvailable && (
                      <button
                        type="button"
                        onClick={() => setCustomTemp('Hot')}
                        className={`py-2 px-4 rounded-xl text-xs font-bold transition text-center ${
                          customTemp === 'Hot'
                            ? 'bg-[#2B1E17] text-white shadow-sm'
                            : 'bg-white border border-[#D2C7BA] text-[#2B1E17] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        🔥 Panas / Hot
                      </button>
                    )}
                    {selectedProduct.isIcedAvailable && (
                      <button
                        type="button"
                        onClick={() => setCustomTemp('Iced')}
                        className={`py-2 px-4 rounded-xl text-xs font-bold transition text-center ${
                          customTemp === 'Iced'
                            ? 'bg-[#2B1E17] text-white shadow-sm'
                            : 'bg-white border border-[#D2C7BA] text-[#2B1E17] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        ❄️ Dingin / Iced
                      </button>
                    )}
                  </div>
                </div>

                {/* Sugar / Sweetness Level option */}
                <div className="space-y-2">
                  <label className="font-semibold block text-xs tracking-wide text-[#4A533C] uppercase">
                    Tingkat Kemanisan (Gula)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { id: 'No Sugar', label: 'No Sugar ❌' },
                      { id: 'Less Sugar', label: 'Less Sugar 🤏' },
                      { id: 'Normal', label: 'Normal Gula 👍' },
                      { id: 'Extra Sugar', label: 'Extra Sweet 🍬' }
                    ] as const).map(option => (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => setCustomSugar(option.id)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-medium transition text-center ${
                          customSugar === option.id
                            ? 'bg-[#4A533C] text-white shadow-xs'
                            : 'bg-white border border-[#D2C7BA] text-[#2B1E17] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* General optional client notes */}
            <div className="space-y-1.5">
              <label className="font-semibold block text-xs tracking-wide text-[#4A533C] uppercase">
                Catatan Pesanan Khusus (Opsional)
              </label>
              <input
                type="text"
                maxLength={90}
                placeholder="Contoh: Susu ganti oatmilk, pisahkan gula batangan..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full bg-white border border-[#D2C7BA] rounded-xl px-4 py-2.5 text-xs text-[#2B1E17] focus:outline-none focus:border-[#4A533C]"
              />
            </div>

            {/* Customizer Quantity actions */}
            <div className="flex justify-between items-center bg-[#F5EFEB] p-3.5 rounded-2xl border border-[#D2C7BA]/50">
              <span className="text-xs font-bold text-[#4A533C]">Jumlah Pesanan:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCustomQty(prev => Math.max(1, prev - 1))}
                  className="p-1 rounded-md bg-white border border-[#D2C7BA] text-[#2B1E17] hover:bg-[#FAF6F0]"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-sm font-bold text-[#2B1E17] min-w-6 text-center">{customQty}</span>
                <button
                  type="button"
                  onClick={() => setCustomQty(prev => prev + 1)}
                  className="p-1 rounded-md bg-white border border-[#D2C7BA] text-[#2B1E17] hover:bg-[#FAF6F0]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-[#2B1E17]/10">
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#2B1E17] hover:bg-[#4A533C] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Tambahkan Sajian • Rp {(selectedProduct.price * customQty).toLocaleString('id-ID')}
            </button>
            <button
              onClick={() => setSelectedProduct(null)}
              className="w-full bg-[#E2D9CD]/40 hover:bg-[#E2D9CD]/80 text-[#2B1E17] py-2.5 rounded-xl text-xs font-bold transition-colors"
            >
              Batalkan
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
