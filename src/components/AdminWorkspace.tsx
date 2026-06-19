import React from 'react';
import { motion } from 'motion/react';
import { Lock, LogOut, Check, X, Search, Plus, Trash2, Printer, Award, MessageSquareReply, DollarSign, HelpCircle, Star } from 'lucide-react';
import { CashierOrder, MenuItem, GuestReview, MenuItemCategory } from '../types.ts';

interface AdminWorkspaceProps {
  orders: CashierOrder[];
  setOrders: React.Dispatch<React.SetStateAction<CashierOrder[]>>;
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  reviews: GuestReview[];
  setReviews: React.Dispatch<React.SetStateAction<GuestReview[]>>;
  
  adminTab: 'orders' | 'inventory' | 'feedbacks';
  setAdminTab: (tab: 'orders' | 'inventory' | 'feedbacks') => void;
  adminOrderFilter: 'All' | 'Pending' | 'On Process' | 'Completed' | 'Cancelled';
  setAdminOrderFilter: (val: 'All' | 'Pending' | 'On Process' | 'Completed' | 'Cancelled') => void;
  
  handleUpdateOrderStatus: (orderId: string, newStatus: 'Pending' | 'On Process' | 'Completed' | 'Cancelled') => void;
  handleToggleProductStock: (id: string) => void;
  handleDeleteProduct: (id: string) => void;
  
  handleCreateProduct: (e: React.FormEvent) => void;
  newProdName: string;
  setNewProdName: (val: string) => void;
  newProdCategory: MenuItemCategory;
  setNewProdCategory: (val: MenuItemCategory) => void;
  newProdDesc: string;
  setNewProdDesc: (val: string) => void;
  newProdPrice: number;
  setNewProdPrice: (val: number) => void;
  newProdTags: string;
  setNewProdTags: (val: string) => void;
  showAddNewProductForm: boolean;
  setShowAddNewProductForm: (val: boolean) => void;
  
  targetFeedbackId: string | null;
  setTargetFeedbackId: (id: string | null) => void;
  feedbackReplyText: string;
  setFeedbackReplyText: (text: string) => void;
  handlePostReply: (reviewId: string) => void;

  totalCompletedEarnings: number;
  pendingOrdersCount: number;
  handleAdminLogout: () => void;
}

export default function AdminWorkspace({
  orders,
  setOrders,
  menuItems,
  setMenuItems,
  reviews,
  setReviews,
  adminTab,
  setAdminTab,
  adminOrderFilter,
  setAdminOrderFilter,
  handleUpdateOrderStatus,
  handleToggleProductStock,
  handleDeleteProduct,
  handleCreateProduct,
  newProdName,
  setNewProdName,
  newProdCategory,
  setNewProdCategory,
  newProdDesc,
  setNewProdDesc,
  newProdPrice,
  setNewProdPrice,
  newProdTags,
  setNewProdTags,
  showAddNewProductForm,
  setShowAddNewProductForm,
  targetFeedbackId,
  setTargetFeedbackId,
  feedbackReplyText,
  setFeedbackReplyText,
  handlePostReply,
  totalCompletedEarnings,
  pendingOrdersCount,
  handleAdminLogout
}: AdminWorkspaceProps) {

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[600px] bg-[#FAF6F0] text-[#2B1E17] font-sans antialiased">
      
      {/* Left Sidebar navigation panel */}
      <div className="w-full md:w-64 border-r border-[#D2C7BA] p-5 flex flex-col justify-between bg-white text-sm">
        
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#4A533C] uppercase font-bold bg-[#4A533C]/10 px-3 py-1 rounded-full inline-block">
              WORKSPACE POS
            </span>
            <h3 className="font-serif text-lg font-bold text-[#2B1E17] mt-2 leading-tight">Control Desk</h3>
            <p className="text-[11px] text-[#4A533C] mt-1">Kelola penjualan, stok ketersediaan, serta ulasan.</p>
          </div>

          <div className="flex flex-col gap-1.5 pt-2">
            {[
              { id: 'orders', label: '📋 Antrean Pesanan', count: pendingOrdersCount },
              { id: 'inventory', label: '🍔 Stok Menu Cafe', count: null },
              { id: 'feedbacks', label: '💬 Jawab Feedback', count: reviews.filter(r => !r.reply).length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex justify-between items-center transition cursor-pointer ${
                  adminTab === tab.id
                    ? 'bg-[#4A533C] text-white shadow-md'
                    : 'text-[#2B1E17]/85 hover:bg-[#FAF6F0]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${adminTab === tab.id ? 'bg-[#FAF6F0] text-[#4A533C]' : 'bg-[#2B1E17] text-white'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Operational live summary report card */}
        <div className="mt-8 space-y-4 pt-4 border-t border-[#D2C7BA]/50">
          <div className="p-4 rounded-2xl bg-[#F5EFEB] border border-[#D2C7BA]/50 font-mono text-xs space-y-2 text-[#2B1E17]">
            <span className="font-bold text-[#4A533C] text-[10px] uppercase block tracking-wider">HARI INI (LIVE):</span>
            <div className="flex justify-between">
              <span>Earnings:</span>
              <span className="font-bold text-[#4A533C]">Rp {totalCompletedEarnings.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Layanan:</span>
              <span className="font-bold">{orders.length} Bill</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Antrean:</span>
              <span className="font-bold text-amber-600 animate-pulse">{pendingOrdersCount} Meja</span>
            </div>
          </div>

          <button
            onClick={handleAdminLogout}
            className="w-full bg-[#2B1E17] hover:bg-red-700 text-white py-3 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Dashboard Admin
          </button>
        </div>
      </div>

      {/* Right workspace controller block */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {/* VIEW TAB 1: LIVE ORDERS QUEUE */}
        {adminTab === 'orders' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#D2C7BA]/40 pb-3">
              <div>
                <h4 className="font-serif text-xl font-bold text-[#2B1E17]">Antrean Bill Meja Kasir</h4>
                <p className="text-xs text-[#4A533C]">Proses tiket antrean yang dikirim oleh pelanggan dari website.</p>
              </div>

              {/* Order Status Filters */}
              <div className="flex bg-white rounded-xl p-1 border border-[#D2C7BA] font-mono text-[10px] font-semibold">
                {(['All', 'Pending', 'On Process', 'Completed', 'Cancelled'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setAdminOrderFilter(f)}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      adminOrderFilter === f
                        ? 'bg-[#2B1E17] text-white shadow-xs'
                        : 'text-[#2B1E17]/70 hover:bg-[#FAF6F0]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* List entries */}
            <div className="space-y-4">
              {orders.filter(o => adminOrderFilter === 'All' || o.status === adminOrderFilter).length > 0 ? (
                orders
                  .filter(o => adminOrderFilter === 'All' || o.status === adminOrderFilter)
                  .map((order) => {
                    const isCompleted = order.status === 'Completed';
                    const isCancelled = order.status === 'Cancelled';
                    const isOnProcess = order.status === 'On Process';

                    return (
                      <div
                        key={order.id}
                        className="bg-white p-5 rounded-2xl border border-[#D2C7BA]/50 shadow-xs space-y-4"
                      >
                        {/* Header ticket strip */}
                        <div className="flex justify-between items-start gap-2 border-b border-[#FAF6F0] pb-3 text-xs font-mono">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#2B1E17]">{order.id}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                isCompleted ? 'bg-emerald-100 text-emerald-800' :
                                isCancelled ? 'bg-red-100 text-red-800' :
                                isOnProcess ? 'bg-sky-100 text-sky-850' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#4A533C] mt-0.5">
                              Atas Nama: <strong className="text-[#2B1E17]">{order.customerName}</strong> • {order.tableNumberOrType} ({order.paymentMethod})
                            </p>
                          </div>
                          <span className="text-[10px] text-[#4A533C]/60 shrink-0">{order.timestamp}</span>
                        </div>

                        {/* List nested products */}
                        <div className="space-y-2">
                          {order.items.map((cartItem, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs bg-[#FAF6F0]/50 p-2.5 rounded-xl border border-[#D2C7BA]/20">
                              <div>
                                <span className="font-semibold text-[#2B1E17]">{cartItem.item.name}</span>
                                <span className="font-mono text-xs text-[#4A533C] ml-2 font-bold">x{cartItem.quantity}</span>
                                <div className="flex flex-wrap gap-1.5 text-[9px] font-mono mt-1 text-[#4A533C]">
                                  {cartItem.temperature && cartItem.temperature !== 'Normal' && <span>⚡ {cartItem.temperature}</span>}
                                  {cartItem.sugarLevel && cartItem.sugarLevel !== 'Normal' && <span>🍬 {cartItem.sugarLevel}</span>}
                                  {cartItem.notes && <span className="italic block font-bold text-[#2B1E17]/80">Catatan: "{cartItem.notes}"</span>}
                                </div>
                              </div>
                              <span className="font-mono font-bold text-[#4A533C]">
                                Rp {(cartItem.item.price * cartItem.quantity).toLocaleString('id-ID')}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Totals & Quick status transition triggers */}
                        <div className="pt-3 border-t border-[#D2C7BA]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="text-sm font-bold text-[#2B1E17] font-serif">
                            Total Tagihan: <span className="text-[#4A533C] font-mono font-bold">Rp {order.totalAmount.toLocaleString('id-ID')}</span>
                          </div>

                          <div className="flex gap-2">
                            {order.status === 'Pending' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'On Process')}
                                className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition block cursor-pointer"
                              >
                                ☕ Proses Seduh
                              </button>
                            )}
                            {(order.status === 'Pending' || order.status === 'On Process') && (
                              <>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'Completed')}
                                  className="bg-[#2B1E17] hover:bg-[#4A533C] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer shadow-xs"
                                >
                                  ✓ Selesai / Layani
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'Cancelled')}
                                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                                >
                                  Batal
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => alert(`Mencetak struk dapur untuk ${order.id}...`)}
                              className="border border-[#D2C7BA] hover:bg-[#FAF6F0] px-3 py-1.5 rounded-lg text-[10px] text-[#2B1E17] cursor-pointer font-semibold flex items-center gap-1.5"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#4A533C]" />
                              Print Dapur
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-12 text-[#4A533C]/60 italic text-xs">
                  Tidak ada antrean pesanan dalam filter ini.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW TAB 2: INVENTORY STOCK MANAGEMENT */}
        {adminTab === 'inventory' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-[#D2C7BA]/40 pb-3">
              <div>
                <h4 className="font-serif text-xl font-bold text-[#2B1E17]">Ketersediaan Stok Menu</h4>
                <p className="text-xs text-[#4A533C]">Nonaktifkan produk yang habis atau masukkan produk baru ke catalog.</p>
              </div>

              <button
                onClick={() => setShowAddNewProductForm(!showAddNewProductForm)}
                className="bg-[#2B1E17] hover:bg-[#4A533C] text-white py-2 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                {showAddNewProductForm ? 'Tutup Form' : 'Tambah Menu'}
              </button>
            </div>

            {/* Create New Product Dialog form */}
            {showAddNewProductForm && (
              <form onSubmit={handleCreateProduct} className="bg-white p-5 rounded-2xl border border-[#D2C7BA] space-y-4 text-xs font-medium animate-fadeIn">
                <h5 className="font-serif text-sm font-bold text-[#2B1E17] border-b pb-2 mb-2">Form Data Produk Baru</h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#4A533C] font-semibold uppercase">Nama Produk</label>
                    <input
                      type="text"
                      className="w-full bg-[#FAF6F0] border border-[#D2C7BA] rounded-lg p-2.5"
                      placeholder="Contoh: Coffee Frappuccino"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#4A533C] font-semibold uppercase">Kategori</label>
                    <select
                      className="w-full bg-[#FAF6F0] border border-[#D2C7BA] rounded-lg p-2.5"
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value as any)}
                    >
                      <option value="coffee">Espresso & Kopi</option>
                      <option value="non-coffee">Minuman Non-Kopi</option>
                      <option value="dessert">Kue & Manisan</option>
                      <option value="food">Makanan Pendamping / Camilan</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#4A533C] font-semibold uppercase">Deskripsi & Cita Rasa</label>
                  <input
                    type="text"
                    className="w-full bg-[#FAF6F0] border border-[#D2C7BA] rounded-lg p-2.5"
                    placeholder="Beri gambaran rasa manis, pahit, creamy, atau porsi penyajian..."
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#4A533C] font-semibold uppercase">Harga (Rupiah)</label>
                    <input
                      type="number"
                      className="w-full bg-[#FAF6F0] border border-[#D2C7BA] rounded-lg p-2.5 font-mono"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#4A533C] font-semibold uppercase">Label Tags (Pisahkan koma)</label>
                    <input
                      type="text"
                      className="w-full bg-[#FAF6F0] border border-[#D2C7BA] rounded-lg p-2.5"
                      placeholder="Signature, Sweet, Sugar-Free..."
                      value={newProdTags}
                      onChange={(e) => setNewProdTags(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#4A533C] hover:bg-[#2B1E17] text-white py-3 rounded-xl font-bold uppercase transition"
                >
                  Terbitkan Menu Baru ke Portal
                </button>
              </form>
            )}

            {/* Catalog list matrix */}
            <div className="bg-white rounded-2xl border border-[#D2C7BA]/50 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-[#2B1E17]">
                <thead className="bg-[#FAF6F0] text-[#4A533C] uppercase text-[10px] font-mono border-b border-[#D2C7BA]/50">
                  <tr>
                    <th className="p-4">Identitas Menu</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Harga</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D2C7BA]/20">
                  {menuItems.map(item => (
                    <tr key={item.id} className="hover:bg-[#FAF6F0]/20 transition">
                      <td className="p-4">
                        <div className="font-bold text-sm text-[#2B1E17]">{item.name}</div>
                        <div className="text-[11px] text-[#4A533C] line-clamp-1 max-w-sm mt-0.5">{item.description}</div>
                      </td>
                      <td className="p-4 font-semibold uppercase tracking-wider text-[10px] text-[#4A533C]">
                        {item.category}
                      </td>
                      <td className="p-4 font-mono font-bold text-[#2B1E17]">
                        Rp {item.price.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleProductStock(item.id)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition cursor-pointer ${
                            item.isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.isAvailable ? '✓ Tersedia' : '✕ Habis'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteProduct(item.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-full cursor-pointer text-sm"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW TAB 3: CUSTOMER FEEDBACK & RESPONSE CABINET */}
        {adminTab === 'feedbacks' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h4 className="font-serif text-xl font-bold text-[#2B1E17]">Cabinet Ulasan Tamu</h4>
              <p className="text-xs text-[#4A533C]">Pantau penilaian pelanggan dan terbitkan balasan resmi atas ulasan mereka.</p>
            </div>

            <div className="space-y-4">
              {reviews.map(rev => (
                <div key={rev.id} className="bg-white p-5 rounded-2xl border border-[#D2C7BA]/50 shadow-xs space-y-3">
                  <div className="flex justify-between text-xs">
                    <div>
                      <strong className="text-sm font-bold text-[#2B1E17] block">{rev.name}</strong>
                      <span className="text-[10px] text-[#4A533C]/60 mt-0.5 block">Kode ID: {rev.id} ({rev.date})</span>
                    </div>
                    <div className="text-amber-500 font-serif">{'★'.repeat(rev.rating)}</div>
                  </div>

                  <p className="text-xs text-[#4A533C] italic bg-[#FAF6F0]/40 p-3 rounded-xl border border-[#D2C7BA]/10">"{rev.comment}"</p>

                  {targetFeedbackId === rev.id ? (
                    <div className="space-y-2 pt-2 animate-fadeIn text-xs">
                      <label className="font-bold text-[#2B1E17] block">Tanggapan Resmi Barista:</label>
                      <textarea
                        className="w-full bg-[#FAF6F0] border border-[#D2C7BA] rounded-xl p-3"
                        placeholder="Tulis balasan terima kasih atau konfirmasi perbaikan pelayanan resmi..."
                        value={feedbackReplyText}
                        onChange={(e) => setFeedbackReplyText(e.target.value)}
                        required
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePostReply(rev.id)}
                          className="bg-[#2B1E17] hover:bg-[#4A533C] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer"
                        >
                          ✓ Terbitkan Tanggapan
                        </button>
                        <button
                          onClick={() => setTargetFeedbackId(null)}
                          className="bg-white border border-[#D2C7BA] text-[#2B1E17] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : rev.reply ? (
                    <div className="bg-[#F5EFEB] p-3.5 rounded-xl border-l-2 border-[#4A533C] text-xs">
                      <span className="font-bold text-[#4A533C] text-[10px] block uppercase">Tanggapan Terbitan Resmi:</span>
                      <p className="text-[#2B1E17] italic mt-1 font-mono text-[11px]">"{rev.reply}"</p>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => { setTargetFeedbackId(rev.id); setFeedbackReplyText(''); }}
                        className="bg-[#2B1E17] hover:bg-[#4A533C] text-white px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition shadow-xs"
                      >
                        <MessageSquareReply className="w-3.5 h-3.5" />
                        Tanggapi Ulasan Tamu
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
