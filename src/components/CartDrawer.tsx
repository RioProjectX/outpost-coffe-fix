import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Minus, Plus, Check, Printer } from 'lucide-react';
import { CartItem, CashierOrder } from '../types.ts';

interface CartDrawerProps {
  isCartOpen: boolean;
  setIsCartOpen: (val: boolean) => void;
  cart: CartItem[];
  checkoutStep: 'view' | 'form' | 'success';
  setCheckoutStep: (val: 'view' | 'form' | 'success') => void;
  custName: string;
  setCustName: (val: string) => void;
  tableOrType: string;
  setTableOrType: (val: string) => void;
  tableNum: string;
  setTableNum: (val: string) => void;
  payMethod: 'Cash' | 'QRIS' | 'Card';
  setPayMethod: (val: 'Cash' | 'QRIS' | 'Card') => void;
  latestSubmittedOrder: CashierOrder | null;
  handleRemoveFromCart: (idx: number) => void;
  handleUpdateCartQty: (idx: number, delta: number) => void;
  handleSubmitOrder: (e: React.FormEvent) => void;
  handleResetCheckout: () => void;
  getSubtotal: () => number;
}

export default function CartDrawer({
  isCartOpen,
  setIsCartOpen,
  cart,
  checkoutStep,
  setCheckoutStep,
  custName,
  setCustName,
  tableOrType,
  setTableOrType,
  tableNum,
  setTableNum,
  payMethod,
  setPayMethod,
  latestSubmittedOrder,
  handleRemoveFromCart,
  handleUpdateCartQty,
  handleSubmitOrder,
  handleResetCheckout,
  getSubtotal
}: CartDrawerProps) {
  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-[#2B1E17]/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Sliding Panel */}
        <div className="absolute inset-y-0 right-0 max-w-full flex">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 210 }}
            className="w-screen max-w-md bg-[#FAF6F0] border-l border-[#D2C7BA] flex flex-col justify-between shadow-2xl relative"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#2B1E17]/10 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#4A533C]" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2B1E17]">Keranjang Pemesanan</h3>
                  <span className="text-[10px] font-mono text-[#4A533C]/75">Table & Takeaway Cart Struk</span>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-full border border-[#D2C7BA] hover:bg-[#FAF6F0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic Body Pane */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-[#2B1E17]">
              {checkoutStep === 'view' && (
                <div className="space-y-4">
                  {cart.length > 0 ? (
                    <>
                      <div className="space-y-3">
                        {cart.map((cartItem, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-4 rounded-2xl border border-[#D2C7BA]/40 flex gap-3 shadow-xs"
                          >
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#FAF6F0] border border-[#D2C7BA]/20">
                              <img
                                src={cartItem.item.imageUrl || (
                                  cartItem.item.category === 'coffee' ? "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=200" :
                                  cartItem.item.category === 'non-coffee' ? "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=200" :
                                  cartItem.item.category === 'food' ? "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=200" :
                                  "https://images.unsplash.com/photo-1508737027454-e6454ef45afd?auto=format&fit=crop&q=80&w=200"
                                )}
                                alt={cartItem.item.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h4 className="font-serif font-black text-xs text-[#2B1E17] leading-tight truncate">
                                  {cartItem.item.name}
                                </h4>
                                <span className="font-mono text-xs font-bold text-[#4A533C] shrink-0 ml-2">
                                  Rp {(cartItem.item.price * cartItem.quantity).toLocaleString('id-ID')}
                                </span>
                              </div>

                              {/* Custom configurations badges */}
                              <div className="flex flex-wrap gap-1.5 text-[9px] font-mono">
                                {cartItem.temperature && cartItem.temperature !== 'Normal' && (
                                  <span className="bg-sky-50 text-sky-850 border border-sky-200/55 px-1.5 py-0.5 rounded">
                                    ❄️ {cartItem.temperature}
                                  </span>
                                )}
                                {cartItem.sugarLevel && cartItem.sugarLevel !== 'Normal' && (
                                  <span className="bg-amber-50 text-amber-800 border border-amber-200/55 px-1.5 py-0.5 rounded">
                                    🍬 {cartItem.sugarLevel}
                                  </span>
                                )}
                                {cartItem.notes && (
                                  <span className="bg-[#FAF6F0] text-[#2B1E17] border border-[#D2C7BA]/30 px-1.5 py-0.5 rounded italic col-span-full max-w-full text-ellipsis overflow-hidden">
                                    📝 "{cartItem.notes}"
                                  </span>
                                )}
                              </div>

                              {/* Action Adjusters */}
                              <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-[#D2C7BA]/30">
                                <button
                                  onClick={() => handleRemoveFromCart(idx)}
                                  className="text-red-600 hover:text-red-700 p-0.5 font-mono text-[9px] uppercase font-bold flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Hapus
                                </button>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleUpdateCartQty(idx, -1)}
                                    className="p-1 rounded bg-[#FAF6F0] border border-[#D2C7BA]"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="font-mono text-xs font-bold text-[#2B1E17]">{cartItem.quantity}</span>
                                  <button
                                    onClick={() => handleUpdateCartQty(idx, 1)}
                                    className="p-1 rounded bg-[#FAF6F0] border border-[#D2C7BA]"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Receipt Bill and Summary */}
                      <div className="bg-white p-4 rounded-2xl border border-[#D2C7BA]/40 font-mono text-xs space-y-2 mt-4 shadow-inner">
                        <div className="flex justify-between">
                          <span>Subtotal Menu:</span>
                          <span>Rp {getSubtotal().toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-[#4A533C] font-bold text-sm border-t border-[#D2C7BA]/30 pt-2 mt-1">
                          <span>Struk Total:</span>
                          <span>Rp {getSubtotal().toLocaleString('id-ID')}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setCheckoutStep('form')}
                        className="w-full bg-[#2B1E17] hover:bg-[#4A533C] text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md mt-4 cursor-pointer"
                      >
                        Lanjutkan Checkout Pemesanan
                      </button>
                    </>
                  ) : (
                    <div className="py-20 text-center text-[#4A533C]/70 space-y-3">
                      <ShoppingBag className="w-12 h-12 mx-auto opacity-30 text-[#2B1E17]" />
                      <p className="text-sm font-semibold">Keranjang belanja Anda kosong.</p>
                      <p className="text-xs">Segera pilih sajian kopi & makanan spesial di menu utama.</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="text-xs text-[#2B1E17] font-bold underline cursor-pointer mt-2"
                      >
                        Kembali ke Menu
                      </button>
                    </div>
                  )}
                </div>
              )}

              {checkoutStep === 'form' && (
                <form onSubmit={handleSubmitOrder} className="space-y-5">
                  <div className="flex justify-between items-center pb-2 border-b border-[#2B1E17]/10 mb-3">
                    <span className="text-xs font-bold text-[#4A533C] uppercase">Selesaikan Antrean</span>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('view')}
                      className="text-[10px] text-[#2B1E17] hover:underline font-semibold"
                    >
                      ← Koreksi Menu
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A533C]">Atas Nama Pemesan</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama Anda..."
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full bg-white border border-[#D2C7BA] rounded-xl px-4 py-3 text-xs text-[#2B1E17] focus:outline-none focus:border-[#4A533C]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A533C]">Metode Penyajian</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTableOrType('Table')}
                        className={`py-2 px-3 rounded-xl text-center text-xs font-semibold transition ${
                          tableOrType === 'Table'
                            ? 'bg-[#2B1E17] text-white shadow-sm'
                            : 'bg-white border border-[#D2C7BA] text-[#2B1E17] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        🍽️ Makan di Sini
                      </button>
                      <button
                        type="button"
                        onClick={() => setTableOrType('Takeaway')}
                        className={`py-2 px-3 rounded-xl text-center text-xs font-semibold transition ${
                          tableOrType === 'Takeaway'
                            ? 'bg-[#2B1E17] text-white shadow-sm'
                            : 'bg-white border border-[#D2C7BA] text-[#2B1E17] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        🛍️ Takeaway / Bawa
                      </button>
                    </div>
                  </div>

                  {tableOrType === 'Table' && (
                    <div className="space-y-2 animate-fadeIn">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#4A533C] block">Pilih Nomor Meja</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['1', '2', '3', '4', '5', '6', '7', '8'].map(num => (
                          <button
                            type="button"
                            key={num}
                            onClick={() => setTableNum(num)}
                            className={`py-2 rounded-lg font-mono text-xs font-semibold text-center transition ${
                              tableNum === num
                                ? 'bg-[#4A533C] text-white shadow-sm'
                                : 'bg-white border border-[#D2C7BA] text-[#2B1E17] hover:bg-[#FAF6F0]'
                            }`}
                          >
                            M-{num}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A533C] block">Metode Pembayaran</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['QRIS', 'Cash', 'Card'] as const).map(m => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setPayMethod(m)}
                          className={`py-2.5 rounded-lg text-[11px] font-semibold text-center transition ${
                            payMethod === m
                              ? 'bg-[#2B1E17] text-white shadow-sm'
                              : 'bg-white border border-[#D2C7BA] text-[#2B1E17] hover:bg-[#FAF6F0]'
                          }`}
                        >
                          {m === 'QRIS' ? '📱 QRIS' : m === 'Cash' ? '💵 Cash' : '💳 Card'}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#4A533C]/80 leading-relaxed italic mt-1 font-mono">
                      *Scan QRIS barcode akan ditampilkan langsung setelah struk berhasil disubmit.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#2B1E17]/10">
                    <div className="flex justify-between font-mono text-sm mb-3 font-semibold">
                      <span>Total Tagihan:</span>
                      <span>Rp {getSubtotal().toLocaleString('id-ID')}</span>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#2B1E17] hover:bg-[#4A533C] text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer"
                    >
                      Kirim Pesanan Ke Barista
                    </button>
                  </div>
                </form>
              )}

              {checkoutStep === 'success' && latestSubmittedOrder && (
                <div className="text-center space-y-6 py-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mx-auto">
                    <Check className="w-6 h-6 animate-pulse" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono tracking-widest text-[#4A533C] bg-[#4A533C]/10 border border-[#4A533C]/20 px-3 py-1 rounded-full uppercase font-bold">
                      Order Berhasil Terkirim
                    </span>
                    <h4 className="font-serif text-lg font-bold text-[#2B1E17] mt-2">
                      Struk Antrean Reservasi
                    </h4>
                    <p className="text-xs text-[#4A533C]/80 max-w-xs mx-auto">
                      Pesanan Anda atas nama <strong className="text-[#2B1E17]">{latestSubmittedOrder.customerName}</strong> telah diteruskan langsung ke bar kasir barista kami.
                    </p>
                  </div>

                  {/* Struk / Barcode details */}
                  <div className="bg-white p-5 rounded-2xl border border-[#D2C7BA] max-w-xs mx-auto text-center space-y-4 shadow-md relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#4A533C]" />
                    <div>
                      <span className="text-[10px] font-mono text-[#4A533C]/70 block">KODE ANTRIAN KASIR:</span>
                      <span className="font-mono text-xl font-bold text-[#2B1E17] tracking-tight">{latestSubmittedOrder.id}</span>
                    </div>

                    {/* Barcode representation */}
                    <div className="w-full h-11 bg-white flex items-center justify-center gap-0.5 border border-[#FAF6F0] p-1">
                      {Array.from({ length: 26 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-[#2B1E17] h-full"
                          style={{ width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2)}px` }}
                        />
                      ))}
                    </div>

                    <div className="font-mono text-[10px] text-[#2B1E17]/80 space-y-1 mt-3 border-t border-[#D2C7BA]/30 pt-3">
                      <div className="flex justify-between">
                        <span>Penyajian:</span>
                        <span className="font-bold text-[#4A533C]">{latestSubmittedOrder.tableNumberOrType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pembayaran:</span>
                        <span className="font-bold">{latestSubmittedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between text-brand-brown border-t border-[#D2C7BA]/30 pt-1.5 font-bold font-mono">
                        <span>Tagihan:</span>
                        <span className="text-[#4A533C]">Rp {latestSubmittedOrder.totalAmount.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 max-w-xs mx-auto">
                    <button
                      onClick={() => alert(`Struk ${latestSubmittedOrder.id} berhasil diunduh ke bentuk PDF!`)}
                      className="w-full bg-[#2B1E17] hover:bg-[#4A533C] text-white p-2.5 rounded-xl font-semibold uppercase tracking-wider text-[10px] flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Unduh / Simpan Struk
                    </button>
                    <button
                      onClick={handleResetCheckout}
                      className="w-full bg-[#4A533C] text-white hover:bg-[#2B1E17] py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition"
                    >
                      Mulai Pesanan Baru
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky footer close */}
            <div className="bg-white p-4 border-t border-[#2B1E17]/10 flex justify-center text-xs">
              <span className="text-[#4A533C]/70">OUTPOST Coffee &copy; 2026 Reservation</span>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
