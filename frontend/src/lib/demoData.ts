/**
 * Client-side demo data for VITE_DEMO_MODE (static hosting / GitHub Pages).
 * State is kept in-memory and mirrored to localStorage so refreshes persist
 * within the same browser. No backend or database is required.
 */
import type {
  CategoryDto,
  CheckoutDto,
  CheckoutResponseDto,
  DailySalesReportDto,
  ProductDto,
  SaleDto,
  SaleItemDto,
  StockMovementDto,
  VoidSaleDto,
} from '@/types/api';
import type { LoginResponseDto, UserDto } from '@/types/auth';

const STORE_KEY = 'jaams_demo_state_v1';
const TOKEN_KEY = 'jaams_token';

type DemoUser = UserDto & { password: string };
type DemoState = {
  users: DemoUser[];
  categories: CategoryDto[];
  products: ProductDto[];
  sales: SaleDto[];
  movements: StockMovementDto[];
  nextIds: { user: number; category: number; product: number; sale: number; movement: number };
};

function nowIso() { return new Date().toISOString(); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function yymm() { return new Date().toISOString().slice(0, 7).replace('-', ''); }

function daysAgoIso(days: number, hour: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 15 * (days + 1), 0, 0);
  return d.toISOString();
}

function seedState(): DemoState {
  const t = daysAgoIso(10, 8);
  const users: DemoUser[] = [
    { id: 1, username: 'admin', email: 'admin@jeffoyshop.local', role: 'Owner', isActive: true, password: 'Admin123!' },
    { id: 2, username: 'jeffoy', email: 'jeffoy@jeffoyshop.local', role: 'Cashier', isActive: true, password: 'Jeffoy123!' },
  ];
  const categories: CategoryDto[] = [
    { id: 1, name: 'Engine Parts', description: 'Plugs, filters, belts, gaskets', isActive: true },
    { id: 2, name: 'Brakes & Suspension', description: 'Pads, shoes, fluids, shocks', isActive: true },
    { id: 3, name: 'Oils & Fluids', description: 'Engine oil, gear oil, coolant, brake fluid', isActive: true },
    { id: 4, name: 'Tires & Wheels', description: 'Tubes, valves, tire care', isActive: true },
    { id: 5, name: 'Electrical', description: 'Bulbs, battery accessories, fuses, wiring', isActive: true },
    { id: 6, name: 'Accessories & Care', description: 'Cleaners, chain lube, gloves, tools', isActive: true },
  ];
  const raw = [
    ['ENG-SPK-001','NGK Spark Plug (Standard)','Plugs, filters, belts',1,85,150,48,10],
    ['ENG-OFL-001','Oil Filter (Universal)','Universal oil filter',1,120,220,23,8],
    ['ENG-AFL-001','Air Filter Element','Engine air filter',1,95,180,5,8],
    ['ENG-VBL-001','Drive Belt','CVT/drive belt',1,260,450,12,5],
    ['BRK-PAD-001','Brake Pads (Front Set)','Front brake pads',2,320,550,14,6],
    ['BRK-SHO-001','Brake Shoe (Rear)','Rear brake shoe',2,280,480,4,6],
    ['BRK-FLD-001','Brake Fluid DOT 3 (250ml)','Brake fluid',2,75,140,30,10],
    ['OIL-ENG-001','Engine Oil 10W-40 (1L)','Semi-synthetic engine oil',3,210,350,33,12],
    ['OIL-GER-001','Gear Oil (120ml)','Scooter gear oil',3,55,100,18,8],
    ['OIL-CLT-001','Radiator Coolant (1L)','Coolant',3,130,240,8,10],
    ['TIR-TUB-001','Inner Tube (17 inch)','Motorcycle inner tube',4,160,280,14,6],
    ['TIR-VLV-001','Tire Valve Set','Valve set',4,25,60,48,15],
    ['ELC-BLB-001','Headlight Bulb HS1','Headlight bulb',5,90,170,20,8],
    ['ELC-FUS-001','Fuse Assortment Pack','Blade fuses',5,45,95,17,6],
    ['ELC-HRN-001','Motorcycle Horn (12V)','12V horn',5,180,320,2,5],
    ['ACC-CHN-001','Chain Lube (120ml)','Chain lubricant',6,110,200,14,6],
    ['ACC-CLN-001','Degreaser Spray (500ml)','Parts cleaner',6,140,250,10,5],
    ['ACC-GLV-001','Riding Gloves (Pair)','Protective gloves',6,240,420,7,4],
  ] as const;
  const products: ProductDto[] = raw.map((r, i) => {
    const stock = r[6] as number;
    const low = r[7] as number;
    return {
      id: i + 1, sku: r[0] as string, name: r[1] as string, description: r[2] as string,
      categoryId: r[3] as number, categoryName: categories[(r[3] as number) - 1].name,
      costPrice: r[4] as number, sellingPrice: r[5] as number,
      stockQuantity: stock, lowStockThreshold: low, isLowStock: stock <= low,
      isActive: true, createdAtUtc: t, updatedAtUtc: t,
    };
  });
  const movements: StockMovementDto[] = products.map((p, i) => ({
    id: i + 1, productId: p.id, productName: p.name, productSKU: p.sku,
    movementType: 'OpeningStock', quantityChange: p.stockQuantity + (i % 3), // rough original
    resultingStockQuantity: p.stockQuantity + (i % 3), saleId: null,
    reference: 'Opening stock (demo)', createdAtUtc: t,
  }));
  // Fix opening to match a plausible original; recompute by adding back sale deductions below
  movements.forEach((m) => { m.quantityChange = m.resultingStockQuantity = products.find(p=>p.id===m.productId)!.stockQuantity; });

  const saleDefs: Array<[number, number, string, Array<[string, number]>]> = [
    [0, 10, 'Cash', [['OIL-ENG-001',1],['ENG-OFL-001',1]]],
    [0, 11, 'GCash', [['ENG-SPK-001',2],['ELC-FUS-001',1]]],
    [0, 12, 'Cash', [['ACC-CHN-001',1],['ACC-CLN-001',1]]],
    [1, 14, 'Cash', [['BRK-PAD-001',1],['BRK-FLD-001',1]]],
    [1, 15, 'GCash', [['TIR-TUB-001',1],['TIR-VLV-001',1]]],
    [2, 10, 'Cash', [['ELC-BLB-001',2],['ELC-HRN-001',1]]],
    [3, 13, 'GCash', [['OIL-ENG-001',2],['ENG-AFL-001',1]]],
    [4, 11, 'Cash', [['ACC-GLV-001',1],['ACC-CHN-001',1]]],
    [5, 16, 'Cash', [['ENG-VBL-001',1],['OIL-CLT-001',1]]],
    [6, 9, 'GCash', [['OIL-GER-001',2],['TIR-VLV-001',1]]],
  ];
  const sales: SaleDto[] = [];
  let mId = movements.length + 1;
  saleDefs.forEach((def, idx) => {
    const [ago, hour, pm, itemsDef] = def;
    const created = daysAgoIso(ago, hour);
    const items: SaleItemDto[] = itemsDef.map(([sku, qty]) => {
      const p = products.find(x => x.sku === sku)!;
      return { productId: p.id, productSKU: p.sku, productName: p.name, quantity: qty, unitPrice: p.sellingPrice, unitCost: p.costPrice, lineTotal: p.sellingPrice * qty };
    });
    const grandTotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const saleNo = `SALE-${yymm()}-${String(idx + 1).padStart(4, '0')}`;
    const sale: SaleDto = { id: idx + 1, saleNumber: saleNo, grandTotal, paymentMethod: pm, status: 'Completed', createdAtUtc: created, voidedAtUtc: null, voidReason: null, items };
    sales.push(sale);
    // Adjust opening movements to reflect pre-sale stock
    items.forEach(it => {
      const om = movements.find(m => m.productId === it.productId && m.movementType === 'OpeningStock');
      if (om) { om.quantityChange += it.quantity; om.resultingStockQuantity += it.quantity; }
      movements.push({ id: mId++, productId: it.productId, productName: it.productName, productSKU: it.productSKU, movementType: 'SaleDeduction', quantityChange: -it.quantity, resultingStockQuantity: products.find(p=>p.id===it.productId)!.stockQuantity, saleId: sale.id, reference: `Sale deduction for ${saleNo}`, createdAtUtc: created });
    });
  });

  return {
    users, categories, products, sales, movements,
    nextIds: { user: 3, category: 7, product: 19, sale: 11, movement: mId },
  };
}

function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as DemoState;
  } catch { /* ignore */ }
  const seeded = seedState();
  saveState(seeded);
  return seeded;
}

function saveState(state: DemoState) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

let state = loadState();

export function resetDemoState() {
  state = seedState();
  saveState(state);
}

// ---- Auth ----
function b64url(obj: object) {
  const json = JSON.stringify(obj);
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function makeToken(user: DemoUser): LoginResponseDto {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 8 * 60 * 60;
  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const payload = b64url({
    sub: String(user.id), unique_name: user.username, role: user.role,
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': user.role,
    exp, jti: `demo-${Date.now()}`,
  });
  return {
    token: `${header}.${payload}.demo`,
    expiresAtUtc: new Date(exp * 1000).toISOString(),
    userId: user.id, username: user.username, role: user.role,
  };
}

function requireAuth(): DemoUser | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))));
    if (payload.exp * 1000 < Date.now()) return null;
    return state.users.find(u => u.username === payload.unique_name && u.isActive) ?? null;
  } catch { return null; }
}

function requireOwner(): DemoUser {
  const u = requireAuth();
  if (!u) throw demoError(401, 'Unauthorized');
  if (u.role !== 'Owner') throw demoError(403, 'Forbidden');
  return u;
}

export class DemoApiError extends Error {
  status: number; statusText: string;
  constructor(message: string, status: number) { super(message); this.name='DemoApiError'; this.status=status; this.statusText=String(status); }
}
function demoError(status: number, msg: string) { return new DemoApiError(msg, status); }

function ok<T>(data: T): T { saveState(state); return JSON.parse(JSON.stringify(data)); }

// ---- Router ----
export async function demoRequest<T>(method: string, url: string, body?: unknown): Promise<T> {
  const path = url.split('?')[0];
  const qs = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
  const m = method.toUpperCase();
  const b = body as Record<string, unknown> | undefined;

  // Auth endpoints
  if (m === 'POST' && path === '/api/auth/login') {
    const u = state.users.find(x => x.username === b?.username && x.isActive);
    if (!u || u.password !== b?.password) throw demoError(401, 'Invalid username or password.');
    return ok(makeToken(u) as unknown as T);
  }
  if (m === 'POST' && path === '/api/auth/logout') return ok(undefined as T);
  if (m === 'GET' && path === '/api/auth/users') {
    requireOwner();
    return ok(state.users.map(({ password: _p, ...u }) => ({ ...u, createdAtUtc: nowIso() })) as unknown as T);
  }
  if (m === 'POST' && path === '/api/auth/users') {
    requireOwner();
    const role = String(b?.role ?? '');
    if (role !== 'Owner' && role !== 'Cashier') throw demoError(400, `Role must be Owner or Cashier.`);
    if (state.users.some(u => u.username.toLowerCase() === String(b?.username).toLowerCase())) throw demoError(409, 'Username already exists.');
    const nu: DemoUser = { id: state.nextIds.user++, username: String(b?.username), email: String(b?.email), role, isActive: true, password: String(b?.password), createdAtUtc: nowIso() };
    state.users.push(nu);
    const { password: _p, ...dto } = nu;
    return ok(dto as unknown as T);
  }

  // Protected below
  const user = requireAuth();
  if (!user) throw demoError(401, 'Unauthorized');

  // Categories
  if (m === 'GET' && (path === '/api/categories' || path === '/api/categories/all')) return ok(state.categories.filter(c => c.isActive) as unknown as T);
  if (m === 'GET' && /^\/api\/categories\/\d+$/.test(path)) {
    const c = state.categories.find(x => x.id === Number(path.split('/').pop()));
    if (!c) throw demoError(404, 'Not found');
    return ok(c as unknown as T);
  }
  if (m === 'POST' && path === '/api/categories') {
    const c: CategoryDto = { id: state.nextIds.category++, name: String(b?.name), description: (b?.description as string) ?? null, isActive: true };
    state.categories.push(c); return ok(c as unknown as T);
  }
  if (m === 'PUT' && /^\/api\/categories\/\d+$/.test(path)) {
    const c = state.categories.find(x => x.id === Number(path.split('/').pop()));
    if (!c) throw demoError(404, 'Not found');
    c.name = String(b?.name); c.description = (b?.description as string) ?? null; return ok(c as unknown as T);
  }

  // Products
  const enrichProducts = () => state.products.filter(p => p.isActive).map(p => ({ ...p, categoryName: state.categories.find(c=>c.id===p.categoryId)?.name ?? p.categoryName, isLowStock: p.stockQuantity <= p.lowStockThreshold }));
  if (m === 'GET' && (path === '/api/products' || path === '/api/products/all')) return ok(enrichProducts() as unknown as T);
  if (m === 'GET' && path === '/api/products/low-stock') return ok(enrichProducts().filter(p => p.isLowStock) as unknown as T);
  if (m === 'GET' && path.startsWith('/api/products/search')) {
    const q = (qs.get('q') ?? '').toLowerCase();
    return ok(enrichProducts().filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) as unknown as T);
  }
  if (m === 'GET' && /^\/api\/products\/\d+$/.test(path)) {
    const p = state.products.find(x => x.id === Number(path.split('/').pop()));
    if (!p) throw demoError(404, 'Not found');
    return ok({ ...p, categoryName: state.categories.find(c=>c.id===p.categoryId)?.name, isLowStock: p.stockQuantity <= p.lowStockThreshold } as unknown as T);
  }
  if (m === 'POST' && path === '/api/products') {
    const opening = Number(b?.openingStock ?? 0);
    const low = Number(b?.lowStockThreshold ?? 5);
    const p: ProductDto = { id: state.nextIds.product++, sku: String(b?.sku), name: String(b?.name), description: (b?.description as string) ?? null, categoryId: Number(b?.categoryId), categoryName: state.categories.find(c=>c.id===Number(b?.categoryId))?.name ?? null, costPrice: Number(b?.costPrice), sellingPrice: Number(b?.sellingPrice), stockQuantity: opening, lowStockThreshold: low, isLowStock: opening <= low, isActive: true, createdAtUtc: nowIso(), updatedAtUtc: nowIso() };
    state.products.push(p);
    state.movements.push({ id: state.nextIds.movement++, productId: p.id, productName: p.name, productSKU: p.sku, movementType: 'OpeningStock', quantityChange: opening, resultingStockQuantity: opening, saleId: null, reference: String(b?.openingStockReason ?? 'Initial stock'), createdAtUtc: nowIso() });
    return ok(p as unknown as T);
  }
  if (m === 'PUT' && /^\/api\/products\/\d+$/.test(path)) {
    const p = state.products.find(x => x.id === Number(path.split('/').pop()));
    if (!p) throw demoError(404, 'Not found');
    Object.assign(p, { sku: b?.sku, name: b?.name, description: b?.description ?? null, categoryId: Number(b?.categoryId), costPrice: Number(b?.costPrice), sellingPrice: Number(b?.sellingPrice), lowStockThreshold: Number(b?.lowStockThreshold), isActive: Boolean(b?.isActive), updatedAtUtc: nowIso() });
    p.categoryName = state.categories.find(c=>c.id===p.categoryId)?.name ?? null; p.isLowStock = p.stockQuantity <= p.lowStockThreshold;
    return ok(p as unknown as T);
  }

  // Stock
  if (m === 'GET' && path === '/api/stockmovements/all') return ok([...state.movements].sort((a,b)=>b.createdAtUtc.localeCompare(a.createdAtUtc)) as unknown as T);
  if (m === 'POST' && /^\/api\/stock\/\d+\/(reorder|adjust|opening)$/.test(path)) {
    const pid = Number(path.split('/')[3]); const p = state.products.find(x=>x.id===pid); if (!p) throw demoError(404,'Not found');
    const qty = Number(b?.quantity ?? 0); const isAdjust = path.endsWith('/adjust');
    const delta = isAdjust ? qty : qty; // adjust passes signed delta in some impls; keep simple: add qty
    p.stockQuantity += delta; p.isLowStock = p.stockQuantity <= p.lowStockThreshold; p.updatedAtUtc = nowIso();
    state.movements.push({ id: state.nextIds.movement++, productId: p.id, productName: p.name, productSKU: p.sku, movementType: path.endsWith('/reorder') ? 'Restock' : isAdjust ? 'Adjustment' : 'OpeningStock', quantityChange: delta, resultingStockQuantity: p.stockQuantity, saleId: null, reference: String(b?.reason ?? ''), createdAtUtc: nowIso() });
    return ok({} as T);
  }

  // Sales
  if (m === 'GET' && path === '/api/sales') return ok([...state.sales].sort((a,b)=>b.createdAtUtc.localeCompare(a.createdAtUtc)) as unknown as T);
  if (m === 'GET' && /^\/api\/sales\/\d+$/.test(path)) {
    const s = state.sales.find(x=>x.id===Number(path.split('/').pop())); if (!s) throw demoError(404,'Not found'); return ok(s as unknown as T);
  }
  if (m === 'POST' && path === '/api/sales/checkout') {
    const req = b as unknown as CheckoutDto;
    const items: SaleItemDto[] = (req.items ?? []).map(it => {
      const p = state.products.find(x=>x.id===it.productId); if (!p) throw demoError(400,'Product not found');
      if (p.stockQuantity < it.quantity) throw demoError(400, `Insufficient stock for ${p.name}`);
      return { productId: p.id, productSKU: p.sku, productName: p.name, quantity: it.quantity, unitPrice: p.sellingPrice, unitCost: p.costPrice, lineTotal: p.sellingPrice * it.quantity };
    });
    const grandTotal = items.reduce((s,i)=>s+i.lineTotal,0);
    const saleNo = `SALE-${yymm()}-${String(state.nextIds.sale).padStart(4,'0')}`;
    const sale: SaleDto = { id: state.nextIds.sale++, saleNumber: saleNo, grandTotal, paymentMethod: req.paymentMethod, status: 'Completed', createdAtUtc: nowIso(), voidedAtUtc: null, voidReason: null, items };
    state.sales.push(sale);
    items.forEach(it => {
      const p = state.products.find(x=>x.id===it.productId)!; p.stockQuantity -= it.quantity; p.isLowStock = p.stockQuantity <= p.lowStockThreshold; p.updatedAtUtc = nowIso();
      state.movements.push({ id: state.nextIds.movement++, productId: p.id, productName: p.name, productSKU: p.sku, movementType: 'SaleDeduction', quantityChange: -it.quantity, resultingStockQuantity: p.stockQuantity, saleId: sale.id, reference: `Sale deduction for ${saleNo}`, createdAtUtc: sale.createdAtUtc });
    });
    const res: CheckoutResponseDto = { saleId: sale.id, saleNumber: sale.saleNumber, grandTotal, paymentMethod: sale.paymentMethod, createdAtUtc: sale.createdAtUtc, items };
    return ok(res as unknown as T);
  }
  if (m === 'POST' && /^\/api\/sales\/\d+\/void$/.test(path)) {
    const s = state.sales.find(x=>x.id===Number(path.split('/')[3])); if (!s) throw demoError(404,'Not found');
    if (s.status === 'Voided') throw demoError(400,'Already voided');
    s.status = 'Voided'; s.voidedAtUtc = nowIso(); s.voidReason = String((b as unknown as VoidSaleDto)?.reason ?? '');
    s.items.forEach(it => { const p = state.products.find(x=>x.id===it.productId); if (p) { p.stockQuantity += it.quantity; p.isLowStock = p.stockQuantity <= p.lowStockThreshold; state.movements.push({ id: state.nextIds.movement++, productId: p.id, productName: p.name, productSKU: p.sku, movementType: 'VoidRestoration', quantityChange: it.quantity, resultingStockQuantity: p.stockQuantity, saleId: s.id, reference: `Void ${s.saleNumber}`, createdAtUtc: nowIso() }); } });
    return ok(s as unknown as T);
  }

  // Reports
  if (m === 'GET' && path === '/api/reports/daily-sales') {
    const date = qs.get('date') ?? todayStr();
    const daySales = state.sales.filter(s => s.createdAtUtc.slice(0,10) === date && s.status === 'Completed');
    const report: DailySalesReportDto = {
      date, transactionCount: daySales.length,
      totalItemsSold: daySales.reduce((n,s)=>n+s.items.reduce((a,i)=>a+i.quantity,0),0),
      totalSales: daySales.reduce((n,s)=>n+s.grandTotal,0),
      cashTotal: daySales.filter(s=>s.paymentMethod==='Cash').reduce((n,s)=>n+s.grandTotal,0),
      gCashTotal: daySales.filter(s=>s.paymentMethod==='GCash').reduce((n,s)=>n+s.grandTotal,0),
      sales: daySales,
    };
    return ok(report as unknown as T);
  }

  if (path.startsWith('/health')) return ok({ status: 'ok' } as unknown as T);
  throw demoError(404, `Demo: no handler for ${m} ${path}`);
}
