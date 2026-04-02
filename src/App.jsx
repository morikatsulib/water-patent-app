import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { Search, Filter, X, ChevronRight, Globe, FileText, BarChart3, Map, ArrowRight, Database, Calendar, Building2, Tag, TrendingUp, CheckCircle2, Clock, AlertCircle, XCircle, MinusCircle, Eye, Plus, Trash2, Edit3, Copy, FolderOpen, Settings, GripVertical, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, LayoutGrid, Save, PlusCircle, Upload, Download, Info } from "lucide-react";

// ═══════════════════════════════════════════════
// CONSTANTS & CONFIG
// ═══════════════════════════════════════════════
const BLOCK_TYPES = [
  { type: "intake", name: "取水", nameEn: "Intake", color: "#3498db", icon: "💧", category: "main" },
  { type: "coagulation", name: "凝集・フロック形成", nameEn: "Coagulation", color: "#9b59b6", icon: "🔬", category: "main" },
  { type: "sedimentation", name: "沈殿", nameEn: "Sedimentation", color: "#e67e22", icon: "⏬", category: "main" },
  { type: "filtration", name: "ろ過", nameEn: "Filtration", color: "#2ecc71", icon: "🧹", category: "main" },
  { type: "disinfection", name: "消毒", nameEn: "Disinfection", color: "#1abc9c", icon: "🛡️", category: "main" },
  { type: "storage", name: "配水池・貯留", nameEn: "Storage", color: "#e74c3c", icon: "🏗️", category: "main" },
  { type: "supply", name: "給水", nameEn: "Supply", color: "#2980b9", icon: "🚰", category: "main" },
  { type: "thickening", name: "汚泥濃縮", nameEn: "Thickening", color: "#7f8c8d", icon: "🔄", category: "sludge" },
  { type: "dewatering", name: "脱水", nameEn: "Dewatering", color: "#95a5a6", icon: "💨", category: "sludge" },
  { type: "drying", name: "乾燥・焼却", nameEn: "Drying", color: "#bdc3c7", icon: "🔥", category: "sludge" },
  { type: "disposal", name: "最終処分", nameEn: "Disposal", color: "#34495e", icon: "♻️", category: "sludge" },
  { type: "custom", name: "カスタム", nameEn: "Custom", color: "#8e44ad", icon: "⚙️", category: "other" },
];

const STATUS_CONFIG = {
  FILED:     { label: "出願済", color: "#F39C12", bg: "#FEF9E7", icon: Clock },
  PUBLISHED: { label: "公開済", color: "#3498DB", bg: "#EBF5FB", icon: Eye },
  EXAMINING: { label: "審査中", color: "#9B59B6", bg: "#F4ECF7", icon: AlertCircle },
  GRANTED:   { label: "登録済", color: "#27AE60", bg: "#EAFAF1", icon: CheckCircle2 },
  EXPIRED:   { label: "失効",   color: "#95A5A6", bg: "#F2F3F4", icon: MinusCircle },
  REJECTED:  { label: "拒絶",   color: "#E74C3C", bg: "#FDEDEC", icon: XCircle },
  WITHDRAWN: { label: "取下げ", color: "#BDC3C7", bg: "#F8F9FA", icon: X },
};

const COUNTRIES = {
  JP: { name: "日本", flag: "🇯🇵" }, US: { name: "米国", flag: "🇺🇸" },
  EP: { name: "欧州", flag: "🇪🇺" }, CN: { name: "中国", flag: "🇨🇳" },
  KR: { name: "韓国", flag: "🇰🇷" }, WO: { name: "PCT", flag: "🌐" },
};

const SAMPLE_PATENTS = [
  { id: "P001", appNum: "JP2022-145678", title: "河川水の高効率取水装置及び取水方法", applicant: "水処理テクノロジー株式会社", filingDate: "2022-06-15", status: "GRANTED", country: "JP", ipc: "E02B 5/02", abstract: "河川水の取水効率を向上させるため、スクリーン構造を改良した取水装置。", blockTypes: ["intake"], familyCount: 3, grantDate: "2024-03-10", expiryDate: "2042-06-15" },
  { id: "P002", appNum: "US2022/0312456", title: "Automated Water Quality Monitoring System for Intake", applicant: "AquaTech Inc.", filingDate: "2022-08-20", status: "EXAMINING", country: "US", ipc: "G01N 33/18", abstract: "AI-driven real-time water quality monitoring system for raw water intake.", blockTypes: ["intake"], familyCount: 2 },
  { id: "P003", appNum: "JP2021-098765", title: "新規ポリ塩化アルミニウム系凝集剤組成物", applicant: "化学工業株式会社", filingDate: "2021-03-22", status: "GRANTED", country: "JP", ipc: "C02F 1/52", abstract: "従来のPACに比べ低温水での凝集性能を大幅に改善した新規凝集剤組成物。", blockTypes: ["coagulation"], familyCount: 5, grantDate: "2023-11-05", expiryDate: "2041-03-22" },
  { id: "P004", appNum: "CN202210987654.3", title: "一种高效絮凝搅拌装置", applicant: "清华大学", filingDate: "2022-09-10", status: "PUBLISHED", country: "CN", ipc: "C02F 1/52", abstract: "高効率フロック形成のための新型撹拌装置。", blockTypes: ["coagulation"], familyCount: 1 },
  { id: "P005", appNum: "EP22185432.1", title: "Dual-polymer flocculant system for water treatment", applicant: "Veolia Water Technologies", filingDate: "2022-07-18", status: "EXAMINING", country: "EP", ipc: "C02F 1/54", abstract: "A dual-polymer flocculant system combining cationic and anionic polymers.", blockTypes: ["coagulation"], familyCount: 4 },
  { id: "P006", appNum: "JP2023-034567", title: "傾斜板式沈殿池の改良構造", applicant: "日立造船株式会社", filingDate: "2023-02-14", status: "FILED", country: "JP", ipc: "B01D 21/02", abstract: "傾斜板の間隔と角度を最適化し、沈殿効率を30%向上。", blockTypes: ["sedimentation"], familyCount: 1 },
  { id: "P007", appNum: "JP2020-178901", title: "高速沈殿処理システム及びその制御方法", applicant: "メタウォーター株式会社", filingDate: "2020-10-25", status: "GRANTED", country: "JP", ipc: "C02F 1/52", abstract: "マイクロサンド投入と機械撹拌を組合せた高速沈殿処理システム。", blockTypes: ["sedimentation", "coagulation"], familyCount: 6, grantDate: "2023-05-20", expiryDate: "2040-10-25" },
  { id: "P008", appNum: "US2023/0056789", title: "AI-Optimized Sedimentation Tank Control", applicant: "Xylem Inc.", filingDate: "2023-01-30", status: "EXAMINING", country: "US", ipc: "C02F 1/00", abstract: "ML-based control system for sedimentation tank operations.", blockTypes: ["sedimentation"], familyCount: 3 },
  { id: "P009", appNum: "JP2021-156789", title: "多層ろ過装置及びろ過方法", applicant: "栗田工業株式会社", filingDate: "2021-09-28", status: "GRANTED", country: "JP", ipc: "B01D 24/00", abstract: "異なる粒径の砂層を多段配置したろ過装置。", blockTypes: ["filtration"], familyCount: 4, grantDate: "2024-01-15", expiryDate: "2041-09-28" },
  { id: "P010", appNum: "JP2022-067890", title: "活性炭再生処理装置", applicant: "オルガノ株式会社", filingDate: "2022-04-12", status: "GRANTED", country: "JP", ipc: "C01B 32/39", abstract: "使用済み活性炭を高効率で再生する装置。再生率95%以上。", blockTypes: ["filtration"], familyCount: 2, grantDate: "2024-08-22", expiryDate: "2042-04-12" },
  { id: "P011", appNum: "WO2023/045678", title: "Ceramic membrane filtration for water purification", applicant: "METAWATER Co., Ltd.", filingDate: "2023-03-15", status: "PUBLISHED", country: "WO", ipc: "B01D 61/14", abstract: "Novel ceramic membrane module with enhanced fouling resistance.", blockTypes: ["filtration"], familyCount: 7 },
  { id: "P012", appNum: "KR10-2022-0123456", title: "나노여과막을 이용한 정수처리 시스템", applicant: "Samsung Engineering", filingDate: "2022-09-20", status: "GRANTED", country: "KR", ipc: "B01D 61/02", abstract: "ナノろ過膜を用いた高度浄水処理システム。", blockTypes: ["filtration"], familyCount: 3, grantDate: "2024-06-18", expiryDate: "2042-09-20" },
  { id: "P013", appNum: "JP2023-089012", title: "次亜塩素酸ナトリウム注入量の自動最適化システム", applicant: "横河電機株式会社", filingDate: "2023-05-20", status: "EXAMINING", country: "JP", ipc: "C02F 1/76", abstract: "リアルタイム水質モニタリングと機械学習を組合せた塩素注入量自動最適化。", blockTypes: ["disinfection"], familyCount: 2 },
  { id: "P014", appNum: "JP2020-234567", title: "紫外線消毒装置の省エネルギー制御方法", applicant: "パナソニック株式会社", filingDate: "2020-12-01", status: "GRANTED", country: "JP", ipc: "C02F 1/32", abstract: "UV-LED光源を用いた消毒装置の省エネルギー制御方法。消費電力60%削減。", blockTypes: ["disinfection"], familyCount: 5, grantDate: "2023-09-10", expiryDate: "2040-12-01" },
  { id: "P015", appNum: "US2021/0234567", title: "Advanced Oxidation Process for Disinfection Byproduct Control", applicant: "Suez Water Technologies", filingDate: "2021-07-15", status: "GRANTED", country: "US", ipc: "C02F 1/72", abstract: "Combined ozone and hydrogen peroxide treatment system.", blockTypes: ["disinfection"], familyCount: 4, grantDate: "2024-02-28", expiryDate: "2041-07-15" },
  { id: "P016", appNum: "JP2022-190123", title: "配水池の水質維持システム", applicant: "クボタ株式会社", filingDate: "2022-11-08", status: "EXAMINING", country: "JP", ipc: "E03B 11/00", abstract: "配水池内の残留塩素濃度を維持するための循環・追加塩素注入システム。", blockTypes: ["storage"], familyCount: 2 },
  { id: "P017", appNum: "JP2021-201234", title: "スマート配水管網の漏水検知方法", applicant: "NEC株式会社", filingDate: "2021-12-15", status: "GRANTED", country: "JP", ipc: "G01M 3/24", abstract: "AIによる配水管網の漏水位置推定技術。", blockTypes: ["storage", "supply"], familyCount: 4, grantDate: "2024-04-05", expiryDate: "2041-12-15" },
  { id: "P018", appNum: "JP2023-112345", title: "直結増圧給水装置の制御方法", applicant: "荏原製作所株式会社", filingDate: "2023-07-01", status: "FILED", country: "JP", ipc: "F04D 15/00", abstract: "需要予測に基づくポンプ運転制御により直結増圧給水の省エネルギー化。", blockTypes: ["supply"], familyCount: 1 },
  { id: "P019", appNum: "JP2021-145678", title: "汚泥濃縮における高分子凝集剤の最適添加方法", applicant: "水ing株式会社", filingDate: "2021-08-30", status: "GRANTED", country: "JP", ipc: "C02F 11/14", abstract: "汚泥濃縮工程での高分子凝集剤添加量をリアルタイムで最適化。薬品コスト20%削減。", blockTypes: ["thickening"], familyCount: 2, grantDate: "2024-02-15", expiryDate: "2041-08-30" },
  { id: "P020", appNum: "JP2023-056789", title: "省エネ型スクリュープレス脱水機", applicant: "月島JFEアクアソリューション", filingDate: "2023-03-25", status: "EXAMINING", country: "JP", ipc: "B01D 33/00", abstract: "スクリュープレスの回転制御を改良し消費電力を30%削減。", blockTypes: ["dewatering"], familyCount: 1 },
];

const TREND_DATA = [
  { year: "2019", count: 1 }, { year: "2020", count: 3 }, { year: "2021", count: 5 },
  { year: "2022", count: 7 }, { year: "2023", count: 4 },
];

// Generate unique IDs
let _idCounter = 0;
function uid() { return `id_${Date.now()}_${++_idCounter}`; }

// ═══════════════════════════════════════════════
// DEFAULT PROJECT DATA
// ═══════════════════════════════════════════════
function createDefaultProject() {
  const blocks = [
    { id: "b1", type: "intake", name: "取水", x: 60, y: 140, color: "#3498db" },
    { id: "b2", type: "coagulation", name: "凝集・フロック形成", x: 240, y: 140, color: "#9b59b6" },
    { id: "b3", type: "sedimentation", name: "沈殿", x: 460, y: 140, color: "#e67e22" },
    { id: "b4", type: "filtration", name: "ろ過", x: 640, y: 140, color: "#2ecc71" },
    { id: "b5", type: "disinfection", name: "消毒", x: 820, y: 140, color: "#1abc9c" },
    { id: "b6", type: "storage", name: "配水池・貯留", x: 1000, y: 140, color: "#e74c3c" },
    { id: "b7", type: "supply", name: "給水", x: 1180, y: 140, color: "#2980b9" },
    { id: "b8", type: "thickening", name: "汚泥濃縮", x: 460, y: 310, color: "#7f8c8d" },
    { id: "b9", type: "dewatering", name: "脱水", x: 640, y: 310, color: "#95a5a6" },
    { id: "b10", type: "drying", name: "乾燥・焼却", x: 820, y: 310, color: "#bdc3c7" },
    { id: "b11", type: "disposal", name: "最終処分", x: 1000, y: 310, color: "#34495e" },
  ];
  const connections = [
    { id: "c1", from: "b1", to: "b2", type: "sequential" },
    { id: "c2", from: "b2", to: "b3", type: "sequential" },
    { id: "c3", from: "b3", to: "b4", type: "sequential" },
    { id: "c4", from: "b4", to: "b5", type: "sequential" },
    { id: "c5", from: "b5", to: "b6", type: "sequential" },
    { id: "c6", from: "b6", to: "b7", type: "sequential" },
    { id: "c7", from: "b3", to: "b8", type: "branch", label: "汚泥" },
    { id: "c8", from: "b8", to: "b9", type: "sequential" },
    { id: "c9", from: "b9", to: "b10", type: "sequential" },
    { id: "c10", from: "b10", to: "b11", type: "sequential" },
  ];
  return {
    id: uid(),
    name: "標準浄水処理プロセス",
    description: "一般的な上水処理フロー（7工程＋汚泥処理）",
    field: "上水処理",
    createdAt: "2026-03-10",
    blocks,
    connections,
    patents: SAMPLE_PATENTS,
  };
}

// ═══════════════════════════════════════════════
// SMALL REUSABLE COMPONENTS
// ═══════════════════════════════════════════════
function StatusBadge({ status, size = "sm" }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;
  const Icon = cfg.icon;
  const sz = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${sz}`}
      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      <Icon size={size === "sm" ? 12 : 14} />{cfg.label}
    </span>
  );
}

function CountryFlag({ code, showName = false }) {
  const c = COUNTRIES[code];
  if (!c) return <span>{code}</span>;
  return (
    <span className="inline-flex items-center gap-1">
      <span style={{ fontSize: "1.1em" }}>{c.flag}</span>
      {showName ? <span className="text-xs text-gray-600">{c.name}</span> : <span className="text-xs text-gray-500">{code}</span>}
    </span>
  );
}

function KpiCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color }}>{value}</div>
        <div className="text-xs text-gray-500">{title}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// PROJECT LIST SCREEN (SCR-011)
// ═══════════════════════════════════════════════
function ProjectListScreen({ projects, onSelect, onCreate, onDelete, onDuplicate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-lg">💧</div>
            <div>
              <h1 className="text-base font-bold text-gray-900">水処理パテントマップ</h1>
              <p className="text-xs text-gray-400">プロジェクト一覧</p>
            </div>
          </div>
          <button onClick={onCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-1.5">
            <Plus size={16} /> 新規プロジェクト
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FolderOpen size={48} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">プロジェクトがありません</p>
            <button onClick={onCreate} className="mt-3 text-blue-600 text-sm hover:underline">最初のプロジェクトを作成</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => onSelect(p.id)}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug">{p.name}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition" onClick={e => e.stopPropagation()}>
                      <button onClick={() => onDuplicate(p.id)} className="p-1 hover:bg-gray-100 rounded" title="複製"><Copy size={14} className="text-gray-400" /></button>
                      <button onClick={() => onDelete(p.id)} className="p-1 hover:bg-red-50 rounded" title="削除"><Trash2 size={14} className="text-red-400" /></button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description || "説明なし"}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><LayoutGrid size={12} />{p.blocks.length} ブロック</span>
                    <span className="flex items-center gap-1"><FileText size={12} />{p.patents.length} 特許</span>
                    <span className="flex items-center gap-1"><Calendar size={12} />{p.createdAt}</span>
                  </div>
                  {p.field && <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">{p.field}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════
// FLOW EDITOR CANVAS (SCR-013 + SCR-014)
// ═══════════════════════════════════════════════
function FlowEditorCanvas({ blocks, connections, onBlocksChange, onConnectionsChange, selectedBlockId, onSelectBlock, patents }) {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);

  const BLOCK_W = 160, BLOCK_H = 72;

  const patentCountForBlock = useCallback((blockType) => {
    return patents.filter(p => p.blockTypes.includes(blockType)).length;
  }, [patents]);

  const handleCanvasMouseDown = (e) => {
    if (e.target === svgRef.current || e.target.tagName === 'rect' && e.target.dataset.bg) {
      onSelectBlock(null);
      if (e.button === 0) {
        setPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    }
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom - dragging.offsetX;
      const y = (e.clientY - rect.top - pan.y) / zoom - dragging.offsetY;
      onBlocksChange(blocks.map(b => b.id === dragging.id ? { ...b, x: Math.round(x), y: Math.round(y) } : b));
    }
    if (panning && panStart) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setPanning(false);
    setPanStart(null);
    if (connecting) setConnecting(null);
  };

  const handleBlockMouseDown = (e, block) => {
    e.stopPropagation();
    if (e.shiftKey) {
      setConnecting({ from: block.id, startX: block.x + BLOCK_W / 2, startY: block.y + BLOCK_H / 2 });
      return;
    }
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;
    setDragging({ id: block.id, offsetX: mouseX - block.x, offsetY: mouseY - block.y });
    onSelectBlock(block.id);
  };

  const handleBlockMouseUp = (e, block) => {
    if (connecting && connecting.from !== block.id) {
      const exists = connections.some(c => c.from === connecting.from && c.to === block.id);
      if (!exists) {
        onConnectionsChange([...connections, { id: uid(), from: connecting.from, to: block.id, type: "sequential", label: "" }]);
      }
      setConnecting(null);
    }
  };

  const deleteConnection = (connId) => {
    onConnectionsChange(connections.filter(c => c.id !== connId));
  };

  const getBlockCenter = (blockId) => {
    const b = blocks.find(bl => bl.id === blockId);
    return b ? { x: b.x + BLOCK_W / 2, y: b.y + BLOCK_H / 2 } : { x: 0, y: 0 };
  };

  return (
    <div className="relative bg-gray-50 rounded-xl border border-gray-200 overflow-hidden" style={{ height: 480 }}>
      {/* Toolbar */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white/90 rounded-lg shadow-sm border border-gray-200 p-1">
        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 hover:bg-gray-100 rounded" title="ズームイン"><ZoomIn size={14} /></button>
        <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-1.5 hover:bg-gray-100 rounded" title="ズームアウト"><ZoomOut size={14} /></button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-1.5 hover:bg-gray-100 rounded" title="リセット"><Maximize2 size={14} /></button>
      </div>
      <div className="absolute top-2 left-2 z-10 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
        Shift+ドラッグで接続 | ドラッグで移動
      </div>

      <svg ref={svgRef} width="100%" height="100%"
        onMouseDown={handleCanvasMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
        style={{ cursor: panning ? 'grabbing' : dragging ? 'move' : 'default' }}>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
          </pattern>
        </defs>

        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid)" data-bg="true" />

          {/* Connections */}
          {connections.map(conn => {
            const from = getBlockCenter(conn.from);
            const to = getBlockCenter(conn.to);
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            return (
              <g key={conn.id}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={conn.type === "branch" ? "#e67e22" : "#94a3b8"} strokeWidth={2}
                  strokeDasharray={conn.type === "branch" ? "6,3" : "none"} markerEnd="url(#arrowhead)" />
                {conn.label && (
                  <text x={midX} y={midY - 8} textAnchor="middle" fontSize="10" fill="#6b7280" className="select-none">{conn.label}</text>
                )}
                <circle cx={midX} cy={midY} r={6} fill="white" stroke="#ef4444" strokeWidth={1.5}
                  className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); deleteConnection(conn.id); }} />
                <text x={midX} y={midY + 3} textAnchor="middle" fontSize="8" fill="#ef4444"
                  className="pointer-events-none opacity-0 hover:opacity-100" style={{ userSelect: 'none' }}>×</text>
              </g>
            );
          })}

          {/* Blocks */}
          {blocks.map(block => {
            const bt = BLOCK_TYPES.find(t => t.type === block.type);
            const pCount = patentCountForBlock(block.type);
            const isSelected = selectedBlockId === block.id;
            return (
              <g key={block.id}
                onMouseDown={e => handleBlockMouseDown(e, block)}
                onMouseUp={e => handleBlockMouseUp(e, block)}
                className="cursor-move">
                <rect x={block.x} y={block.y} width={BLOCK_W} height={BLOCK_H} rx={12}
                  fill={isSelected ? `${block.color || bt?.color || '#888'}20` : "white"}
                  stroke={block.color || bt?.color || "#888"} strokeWidth={isSelected ? 3 : 2} />
                <text x={block.x + BLOCK_W / 2} y={block.y + 28} textAnchor="middle"
                  fontSize="13" fontWeight="bold" fill="#1f2937" className="select-none">
                  {bt?.icon || "⚙️"} {block.name}
                </text>
                <text x={block.x + BLOCK_W / 2} y={block.y + 48} textAnchor="middle"
                  fontSize="10" fill="#6b7280" className="select-none">
                  {bt?.nameEn || block.type}
                </text>
                {/* Patent count badge */}
                {pCount > 0 && (
                  <g>
                    <circle cx={block.x + BLOCK_W - 8} cy={block.y + 8} r={12}
                      fill={block.color || bt?.color || "#888"} />
                    <text x={block.x + BLOCK_W - 8} y={block.y + 12} textAnchor="middle"
                      fontSize="10" fill="white" fontWeight="bold" className="select-none">{pCount}</text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════
// BLOCK PALETTE (SCR-014)
// ═══════════════════════════════════════════════
function BlockPalette({ onAddBlock }) {
  const categories = { main: "主要工程", sludge: "汚泥処理", other: "その他" };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <LayoutGrid size={14} /> ブロックパレット
      </h3>
      {Object.entries(categories).map(([cat, label]) => (
        <div key={cat} className="mb-3">
          <div className="text-xs font-medium text-gray-400 mb-1.5">{label}</div>
          <div className="grid grid-cols-2 gap-1.5">
            {BLOCK_TYPES.filter(t => t.category === cat).map(bt => (
              <button key={bt.type} onClick={() => onAddBlock(bt)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition text-left text-xs">
                <span>{bt.icon}</span>
                <span className="truncate">{bt.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════
// PATENT LIST & DETAIL
// ═══════════════════════════════════════════════
function PatentListItem({ patent, onClick, onEdit, onDelete }) {
  return (
    <div onClick={() => onClick(patent)}
      className="p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all group">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="text-sm font-semibold text-gray-800 leading-snug flex-1">{patent.title}</div>
        <div className="flex items-center gap-1 shrink-0">
          <StatusBadge status={patent.status} />
          <div className="flex gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition" onClick={e => e.stopPropagation()}>
            <button onClick={() => onEdit(patent)} className="p-1 hover:bg-blue-50 rounded" title="編集"><Edit3 size={13} className="text-blue-400" /></button>
            <button onClick={() => onDelete(patent)} className="p-1 hover:bg-red-50 rounded" title="削除"><Trash2 size={13} className="text-red-400" /></button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><FileText size={11} />{patent.appNum}</span>
        <CountryFlag code={patent.country} />
        <span className="flex items-center gap-1"><Building2 size={11} />{patent.applicant}</span>
      </div>
      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Calendar size={11} />{patent.filingDate}</span>
        <span className="flex items-center gap-1"><Tag size={11} />{patent.ipc}</span>
        {patent.familyCount > 1 && <span className="flex items-center gap-1"><Globe size={11} />ファミリー {patent.familyCount}件</span>}
      </div>
    </div>
  );
}

function PatentDetailModal({ patent, onClose, onEdit }) {
  if (!patent) return null;
  const remainYears = patent.expiryDate
    ? Math.max(0, Math.round((new Date(patent.expiryDate) - new Date()) / (365.25 * 24 * 60 * 60 * 1000))) : null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={patent.status} size="md" />
                <CountryFlag code={patent.country} showName />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{patent.title}</h2>
            </div>
            <div className="flex items-center gap-1">
              {onEdit && (
                <button onClick={() => { onClose(); onEdit(patent); }} className="p-1.5 hover:bg-blue-50 rounded-lg transition" title="編集">
                  <Edit3 size={18} className="text-blue-500" />
                </button>
              )}
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[["出願番号", patent.appNum, FileText], ["出願人", patent.applicant, Building2],
              ["出願日", patent.filingDate, Calendar], ["IPC分類", patent.ipc, Tag],
              ...(patent.grantDate ? [["登録日", patent.grantDate, CheckCircle2]] : []),
              ...(patent.expiryDate ? [["満了日", patent.expiryDate, Clock]] : []),
            ].map(([label, value, Icon], i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                <Icon size={14} className="text-gray-400 shrink-0" />
                <div><div className="text-xs text-gray-400">{label}</div><div className="text-sm font-medium text-gray-700">{value}</div></div>
              </div>
            ))}
          </div>
          {remainYears !== null && patent.status === "GRANTED" && (
            <div className="mb-5 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-green-800">残存年数</span>
                <span className="text-sm font-bold text-green-700">{remainYears}年</span>
              </div>
              <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(remainYears / 20) * 100}%` }} />
              </div>
            </div>
          )}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-1.5">要約</h3>
            <p className="text-sm text-gray-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg">{patent.abstract}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1.5">関連ブロック</h3>
            <div className="flex flex-wrap gap-2">
              {patent.blockTypes.map(bt => {
                const info = BLOCK_TYPES.find(t => t.type === bt);
                return info ? (
                  <span key={bt} className="px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: info.color }}>
                    {info.icon} {info.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// PATENT FORM MODAL (Create / Edit)
// ═══════════════════════════════════════════════
function PatentFormModal({ patent, onSave, onClose }) {
  const isEdit = !!patent;
  const [formData, setFormData] = useState(() => patent ? { ...patent, blockTypes: [...patent.blockTypes] } : {
    appNum: "", title: "", applicant: "", filingDate: "", status: "FILED", country: "JP",
    ipc: "", abstract: "", blockTypes: [], familyCount: 1, grantDate: "", expiryDate: "",
  });
  const [errors, setErrors] = useState({});
  const setField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
  const toggleBlockType = (type) => setFormData(prev => ({
    ...prev, blockTypes: prev.blockTypes.includes(type) ? prev.blockTypes.filter(t => t !== type) : [...prev.blockTypes, type],
  }));

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = "タイトルは必須です";
    if (!formData.appNum.trim()) e.appNum = "出願番号は必須です";
    if (!formData.applicant.trim()) e.applicant = "出願人は必須です";
    if (!formData.filingDate) e.filingDate = "出願日は必須です";
    if (formData.blockTypes.length === 0) e.blockTypes = "関連ブロックを1つ以上選択してください";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const result = { ...formData, id: isEdit ? patent.id : uid(), familyCount: Number(formData.familyCount) || 1 };
    if (!result.grantDate) delete result.grantDate;
    if (!result.expiryDate) delete result.expiryDate;
    onSave(result);
  };

  const inputCls = (field) => `w-full border ${errors[field] ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-200"} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2`;
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <DialogOverlay onClose={onClose} size="lg">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          {isEdit ? <><Edit3 size={16} className="text-blue-500" /> 特許を編集</> : <><PlusCircle size={16} className="text-blue-500" /> 特許を追加</>}
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
      </div>

      <div className="space-y-4">
        {/* Row 1: appNum + status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>出願番号 <span className="text-red-400">*</span></label>
            <input type="text" value={formData.appNum} onChange={e => setField("appNum", e.target.value)} className={inputCls("appNum")} placeholder="例: JP2023-123456" />
            {errors.appNum && <span className="text-xs text-red-500">{errors.appNum}</span>}
          </div>
          <div>
            <label className={labelCls}>ステータス</label>
            <select value={formData.status} onChange={e => setField("status", e.target.value)} className={`${inputCls("")} bg-white`}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: title */}
        <div>
          <label className={labelCls}>タイトル <span className="text-red-400">*</span></label>
          <input type="text" value={formData.title} onChange={e => setField("title", e.target.value)} className={inputCls("title")} placeholder="特許のタイトル" />
          {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
        </div>

        {/* Row 3: applicant + country */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>出願人 <span className="text-red-400">*</span></label>
            <input type="text" value={formData.applicant} onChange={e => setField("applicant", e.target.value)} className={inputCls("applicant")} placeholder="出願人名" />
            {errors.applicant && <span className="text-xs text-red-500">{errors.applicant}</span>}
          </div>
          <div>
            <label className={labelCls}>出願国</label>
            <select value={formData.country} onChange={e => setField("country", e.target.value)} className={`${inputCls("")} bg-white`}>
              {Object.entries(COUNTRIES).map(([code, c]) => <option key={code} value={code}>{c.flag} {c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Row 4: ipc + familyCount */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>IPC分類</label>
            <input type="text" value={formData.ipc} onChange={e => setField("ipc", e.target.value)} className={inputCls("")} placeholder="例: C02F 1/52" />
          </div>
          <div>
            <label className={labelCls}>ファミリー数</label>
            <input type="number" min="0" value={formData.familyCount} onChange={e => setField("familyCount", e.target.value)} className={inputCls("")} />
          </div>
        </div>

        {/* Row 5: dates */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>出願日 <span className="text-red-400">*</span></label>
            <input type="date" value={formData.filingDate} onChange={e => setField("filingDate", e.target.value)} className={inputCls("filingDate")} />
            {errors.filingDate && <span className="text-xs text-red-500">{errors.filingDate}</span>}
          </div>
          <div>
            <label className={labelCls}>登録日</label>
            <input type="date" value={formData.grantDate || ""} onChange={e => setField("grantDate", e.target.value)} className={inputCls("")} />
          </div>
          <div>
            <label className={labelCls}>満了日</label>
            <input type="date" value={formData.expiryDate || ""} onChange={e => setField("expiryDate", e.target.value)} className={inputCls("")} />
          </div>
        </div>

        {/* Row 6: abstract */}
        <div>
          <label className={labelCls}>要約</label>
          <textarea rows={3} value={formData.abstract} onChange={e => setField("abstract", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            placeholder="特許の要約を入力..." />
        </div>

        {/* Row 7: block types */}
        <div>
          <label className={labelCls}>関連工程ブロック <span className="text-red-400">*</span></label>
          {errors.blockTypes && <span className="text-xs text-red-500 mb-1 block">{errors.blockTypes}</span>}
          <div className="space-y-2 mt-1">
            {[["main", "主要工程"], ["sludge", "汚泥処理"], ["other", "その他"]].map(([cat, label]) => (
              <div key={cat}>
                <div className="text-xs text-gray-400 mb-1">{label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {BLOCK_TYPES.filter(bt => bt.category === cat).map(bt => {
                    const sel = formData.blockTypes.includes(bt.type);
                    return (
                      <button key={bt.type} type="button" onClick={() => toggleBlockType(bt.type)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${sel ? "text-white border-transparent" : "text-gray-600 border-gray-200 hover:border-blue-300 bg-white"}`}
                        style={sel ? { backgroundColor: bt.color } : {}}>
                        {bt.icon} {bt.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">キャンセル</button>
        <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5">
          <Save size={14} /> {isEdit ? "保存" : "作成"}
        </button>
      </div>
    </DialogOverlay>
  );
}

// ═══════════════════════════════════════════════
// PATENT DELETE CONFIRM
// ═══════════════════════════════════════════════
function PatentDeleteConfirm({ patent, onConfirm, onClose }) {
  return (
    <DialogOverlay onClose={onClose}>
      <h3 className="text-sm font-bold text-gray-900 mb-2">特許削除</h3>
      <p className="text-sm text-gray-600 mb-1">以下の特許を削除しますか？</p>
      <p className="text-sm font-medium text-gray-800 mb-0.5">{patent.title}</p>
      <p className="text-xs text-gray-500 mb-4">{patent.appNum}</p>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">キャンセル</button>
        <button onClick={() => onConfirm(patent.id)} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">削除</button>
      </div>
    </DialogOverlay>
  );
}

// ═══════════════════════════════════════════════
// CSV IMPORT
// ═══════════════════════════════════════════════

// Parse CSV text handling quoted fields, newlines in quotes, etc.
function parseCSV(text) {
  const rows = [];
  let current = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { current.push(field.trim()); field = ""; }
      else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
        current.push(field.trim()); field = "";
        if (current.some(c => c !== "")) rows.push(current);
        current = [];
        if (ch === '\r') i++;
      } else {
        field += ch;
      }
    }
  }
  current.push(field.trim());
  if (current.some(c => c !== "")) rows.push(current);
  return rows;
}

const CSV_COLUMN_MAP = {
  "出願番号": "appNum", "appnum": "appNum", "application_number": "appNum", "application number": "appNum", "出願番号/登録番号": "appNum",
  "タイトル": "title", "title": "title", "発明の名称": "title", "名称": "title",
  "出願人": "applicant", "applicant": "applicant", "出願人/権利者": "applicant", "権利者": "applicant",
  "出願日": "filingDate", "filing_date": "filingDate", "filing date": "filingDate", "filingdate": "filingDate",
  "ステータス": "status", "status": "status", "法的状態": "status", "法的状況": "status",
  "出願国": "country", "country": "country", "国コード": "country", "国": "country",
  "ipc": "ipc", "ipc分類": "ipc", "ipc classification": "ipc", "国際特許分類": "ipc",
  "要約": "abstract", "abstract": "abstract", "概要": "abstract",
  "工程": "blockTypes", "blocktypes": "blockTypes", "block_types": "blockTypes", "関連工程": "blockTypes", "工程ブロック": "blockTypes",
  "ファミリー数": "familyCount", "familycount": "familyCount", "family_count": "familyCount", "family count": "familyCount", "パテントファミリー": "familyCount",
  "登録日": "grantDate", "grant_date": "grantDate", "grant date": "grantDate", "grantdate": "grantDate",
  "満了日": "expiryDate", "expiry_date": "expiryDate", "expiry date": "expiryDate", "expirydate": "expiryDate", "期限日": "expiryDate",
};

const STATUS_LABEL_MAP = {
  "出願済": "FILED", "filed": "FILED",
  "公開済": "PUBLISHED", "published": "PUBLISHED",
  "審査中": "EXAMINING", "examining": "EXAMINING",
  "登録済": "GRANTED", "granted": "GRANTED",
  "失効": "EXPIRED", "expired": "EXPIRED",
  "拒絶": "REJECTED", "rejected": "REJECTED",
  "取下げ": "WITHDRAWN", "withdrawn": "WITHDRAWN",
};

function normalizePatentRow(row, columnMapping) {
  const patent = { id: uid(), blockTypes: [], familyCount: 1 };
  for (const [csvIdx, field] of Object.entries(columnMapping)) {
    const val = row[csvIdx];
    if (val === undefined || val === "") continue;
    switch (field) {
      case "status": {
        const upper = val.toUpperCase();
        patent.status = STATUS_CONFIG[upper] ? upper : (STATUS_LABEL_MAP[val] || STATUS_LABEL_MAP[val.toLowerCase()] || "FILED");
        break;
      }
      case "country": {
        const upper = val.toUpperCase();
        patent.country = COUNTRIES[upper] ? upper : "JP";
        break;
      }
      case "blockTypes": {
        const types = val.split(/[;|、,]/).map(s => s.trim().toLowerCase()).filter(Boolean);
        const validTypes = BLOCK_TYPES.map(b => b.type);
        patent.blockTypes = types.filter(t => validTypes.includes(t));
        if (patent.blockTypes.length === 0) patent.blockTypes = types.length > 0 ? types : [];
        break;
      }
      case "familyCount":
        patent.familyCount = parseInt(val, 10) || 1;
        break;
      default:
        patent[field] = val;
    }
  }
  return patent;
}

function validatePatent(p) {
  const errors = [];
  if (!p.appNum) errors.push("出願番号が必要です");
  if (!p.title) errors.push("タイトルが必要です");
  if (!p.applicant) errors.push("出願人が必要です");
  if (!p.filingDate) errors.push("出願日が必要です");
  return errors;
}

function CSVImportModal({ onImport, onClose }) {
  const [step, setStep] = useState("upload"); // upload | mapping | preview
  const [rawRows, setRawRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [parsedPatents, setParsedPatents] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [importMode, setImportMode] = useState("append"); // append | replace
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const rows = parseCSV(text);
      if (rows.length < 2) return;
      const hdrs = rows[0];
      setHeaders(hdrs);
      setRawRows(rows.slice(1));

      // Auto-map columns
      const mapping = {};
      hdrs.forEach((h, idx) => {
        const key = h.toLowerCase().trim();
        if (CSV_COLUMN_MAP[key]) mapping[idx] = CSV_COLUMN_MAP[key];
      });
      setColumnMapping(mapping);
      setStep("mapping");
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      const fakeEvent = { target: { files: [file] } };
      handleFile(fakeEvent);
    }
  };

  const proceedToPreview = () => {
    const patents = rawRows.map(row => normalizePatentRow(row, columnMapping));
    const errs = patents.map((p, i) => ({ row: i + 2, errors: validatePatent(p) })).filter(e => e.errors.length > 0);
    setParsedPatents(patents);
    setValidationErrors(errs);
    setStep("preview");
  };

  const doImport = () => {
    const valid = parsedPatents.filter((_, i) => !validationErrors.find(e => e.row === i + 2));
    onImport(valid, importMode);
    onClose();
  };

  const downloadTemplate = () => {
    const bom = "\uFEFF";
    const header = "出願番号,タイトル,出願人,出願日,ステータス,出願国,IPC分類,要約,工程,ファミリー数,登録日,満了日";
    const example = "JP2024-000001,水処理装置の改良,サンプル株式会社,2024-01-15,出願済,JP,C02F 1/52,水処理装置の効率を向上させる改良技術,filtration,1,,";
    const csv = bom + header + "\n" + example + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "特許インポートテンプレート.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedPatents.length - validationErrors.length;

  const PATENT_FIELDS = [
    { key: "appNum", label: "出願番号" }, { key: "title", label: "タイトル" }, { key: "applicant", label: "出願人" },
    { key: "filingDate", label: "出願日" }, { key: "status", label: "ステータス" }, { key: "country", label: "出願国" },
    { key: "ipc", label: "IPC分類" }, { key: "abstract", label: "要約" }, { key: "blockTypes", label: "工程ブロック" },
    { key: "familyCount", label: "ファミリー数" }, { key: "grantDate", label: "登録日" }, { key: "expiryDate", label: "満了日" },
  ];

  return (
    <DialogOverlay onClose={onClose} size="xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Upload size={16} className="text-blue-500" /> CSVインポート
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-5">
        {[["upload", "1. ファイル選択"], ["mapping", "2. カラム設定"], ["preview", "3. プレビュー"]].map(([key, label]) => (
          <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
            step === key ? "bg-blue-100 text-blue-700" : "text-gray-400"}`}>
            {label}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div>
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 transition cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={handleDrop}
          >
            <Upload size={36} className="mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600 mb-1">CSVファイルをドラッグ＆ドロップ</p>
            <p className="text-xs text-gray-400">またはクリックしてファイルを選択</p>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-blue-700 flex items-center gap-1 mb-1"><Info size={12} /> CSVフォーマット</p>
                <p className="text-xs text-blue-600">
                  1行目をヘッダー行としてカラム名を自動認識します。対応カラム名: 出願番号, タイトル, 出願人, 出願日, ステータス, 出願国, IPC分類, 要約, 工程, ファミリー数, 登録日, 満了日
                </p>
              </div>
              <button onClick={downloadTemplate}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-100 transition flex items-center gap-1">
                <Download size={12} /> テンプレート
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {step === "mapping" && (
        <div>
          <p className="text-xs text-gray-500 mb-3">CSVのカラムと特許データのフィールドを対応付けてください。{headers.length}カラム, {rawRows.length}行を検出しました。</p>
          <div className="max-h-[360px] overflow-y-auto space-y-2">
            {headers.map((h, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <span className="text-xs font-medium text-gray-700 w-40 truncate" title={h}>{h}</span>
                <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
                <select
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-200"
                  value={columnMapping[idx] || ""}
                  onChange={e => {
                    const v = e.target.value;
                    setColumnMapping(prev => {
                      const next = { ...prev };
                      if (v) next[idx] = v; else delete next[idx];
                      return next;
                    });
                  }}
                >
                  <option value="">-- スキップ --</option>
                  {PATENT_FIELDS.map(f => (
                    <option key={f.key} value={f.key} disabled={Object.values(columnMapping).includes(f.key) && columnMapping[idx] !== f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
                {columnMapping[idx] && <span className="text-xs text-green-600">&#10003;</span>}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button onClick={() => setStep("upload")} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">戻る</button>
            <button onClick={proceedToPreview}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={Object.keys(columnMapping).length === 0}>
              プレビュー
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">インポート件数:</span>
              <span className="font-bold text-blue-700">{validCount}</span>
              <span className="text-gray-400">/ {parsedPatents.length} 件</span>
            </div>
            {validationErrors.length > 0 && (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle size={12} /> {validationErrors.length}件にエラーあり（スキップされます）
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded-lg">
            <span className="text-xs text-gray-500">インポート方法:</span>
            <label className="flex items-center gap-1 text-xs cursor-pointer">
              <input type="radio" name="importMode" value="append" checked={importMode === "append"} onChange={() => setImportMode("append")} className="accent-blue-600" />
              追加（既存データに追加）
            </label>
            <label className="flex items-center gap-1 text-xs cursor-pointer">
              <input type="radio" name="importMode" value="replace" checked={importMode === "replace"} onChange={() => setImportMode("replace")} className="accent-blue-600" />
              置換（既存データを置換）
            </label>
          </div>

          <div className="max-h-[280px] overflow-auto border border-gray-200 rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-2 py-1.5 text-left text-gray-500 font-medium">行</th>
                  <th className="px-2 py-1.5 text-left text-gray-500 font-medium">出願番号</th>
                  <th className="px-2 py-1.5 text-left text-gray-500 font-medium">タイトル</th>
                  <th className="px-2 py-1.5 text-left text-gray-500 font-medium">出願人</th>
                  <th className="px-2 py-1.5 text-left text-gray-500 font-medium">出願国</th>
                  <th className="px-2 py-1.5 text-left text-gray-500 font-medium">状態</th>
                </tr>
              </thead>
              <tbody>
                {parsedPatents.map((p, i) => {
                  const err = validationErrors.find(e => e.row === i + 2);
                  return (
                    <tr key={i} className={`border-t border-gray-100 ${err ? "bg-red-50" : "hover:bg-gray-50"}`}>
                      <td className="px-2 py-1.5 text-gray-400">{i + 2}</td>
                      <td className="px-2 py-1.5">{p.appNum || <span className="text-red-400">未設定</span>}</td>
                      <td className="px-2 py-1.5 max-w-[200px] truncate">{p.title || <span className="text-red-400">未設定</span>}</td>
                      <td className="px-2 py-1.5">{p.applicant || <span className="text-red-400">未設定</span>}</td>
                      <td className="px-2 py-1.5">{p.country && COUNTRIES[p.country] ? `${COUNTRIES[p.country].flag} ${p.country}` : "-"}</td>
                      <td className="px-2 py-1.5">
                        {err ? <span className="text-red-500" title={err.errors.join(", ")}>&#9888; エラー</span>
                          : p.status && STATUS_CONFIG[p.status] ? <StatusBadge status={p.status} /> : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-4">
            <button onClick={() => setStep("mapping")} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">戻る</button>
            <button onClick={doImport}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5 disabled:opacity-50"
              disabled={validCount === 0}>
              <Download size={14} /> {validCount}件をインポート
            </button>
          </div>
        </div>
      )}
    </DialogOverlay>
  );
}

// ═══════════════════════════════════════════════
// STATS PANEL
// ═══════════════════════════════════════════════
function StatsPanel({ patents }) {
  const statusData = useMemo(() =>
    Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
      name: cfg.label, value: patents.filter(p => p.status === key).length, color: cfg.color,
    })).filter(d => d.value > 0), [patents]
  );
  const countryData = useMemo(() =>
    Object.entries(COUNTRIES).map(([code, info]) => ({
      name: `${info.flag} ${info.name}`, value: patents.filter(p => p.country === code).length,
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value), [patents]
  );
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><BarChart3 size={16} className="text-blue-500" /> 権利化状態別</h3>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={2}>
            {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie><Tooltip formatter={(v, n) => [`${v}件`, n]} /></PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 mt-1 justify-center">
          {statusData.map((d, i) => (<span key={i} className="text-xs flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: d.color }} />{d.name} ({d.value})</span>))}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Globe size={16} className="text-green-500" /> 出願国別</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={countryData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v}件`]} /><Bar dataKey="value" fill="#3498db" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-orange-500" /> 出願トレンド</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={TREND_DATA} margin={{ left: -10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v}件`, "出願数"]} />
            <Line type="monotone" dataKey="count" stroke="#e67e22" strokeWidth={2.5} dot={{ fill: "#e67e22", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// PROJECT DASHBOARD (inside project)
// ═══════════════════════════════════════════════
function ProjectDashboard({ project, onUpdateProject, onBack }) {
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [selectedPatent, setSelectedPatent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [countryFilter, setCountryFilter] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [projectName, setProjectName] = useState(project.name);

  const selectedBlock = project.blocks.find(b => b.id === selectedBlockId);
  const selectedBlockType = selectedBlock ? selectedBlock.type : null;

  const filteredPatents = useMemo(() => {
    let result = project.patents;
    if (selectedBlockType) {
      result = result.filter(p => p.blockTypes.includes(selectedBlockType));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) || p.appNum.toLowerCase().includes(q) ||
        p.applicant.toLowerCase().includes(q) || p.abstract.toLowerCase().includes(q) || p.ipc.toLowerCase().includes(q)
      );
    }
    if (statusFilter.length > 0) result = result.filter(p => statusFilter.includes(p.status));
    if (countryFilter.length > 0) result = result.filter(p => countryFilter.includes(p.country));
    return result;
  }, [project.patents, selectedBlockType, searchQuery, statusFilter, countryFilter]);

  const toggleStatus = (s) => setStatusFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleCountry = (c) => setCountryFilter(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const addBlock = (bt) => {
    const newBlock = { id: uid(), type: bt.type, name: bt.name, x: 100 + Math.random() * 200, y: 100 + Math.random() * 200, color: bt.color };
    onUpdateProject({ ...project, blocks: [...project.blocks, newBlock] });
  };

  const deleteBlock = () => {
    if (!selectedBlockId) return;
    onUpdateProject({
      ...project,
      blocks: project.blocks.filter(b => b.id !== selectedBlockId),
      connections: project.connections.filter(c => c.from !== selectedBlockId && c.to !== selectedBlockId),
    });
    setSelectedBlockId(null);
  };

  // ── Patent CRUD ──
  const [patentFormMode, setPatentFormMode] = useState(null); // null | "create" | "edit"
  const [editingPatent, setEditingPatent] = useState(null);
  const [deletingPatent, setDeletingPatent] = useState(null);

  const openCreatePatent = () => { setEditingPatent(null); setPatentFormMode("create"); };
  const openEditPatent = (p) => { setEditingPatent(p); setPatentFormMode("edit"); };
  const savePatent = (data) => {
    if (patentFormMode === "create") {
      onUpdateProject({ ...project, patents: [...project.patents, data] });
    } else {
      onUpdateProject({ ...project, patents: project.patents.map(p => p.id === data.id ? data : p) });
    }
    setPatentFormMode(null);
    setEditingPatent(null);
  };
  const openDeletePatent = (p) => setDeletingPatent(p);
  const confirmDeletePatent = (id) => {
    onUpdateProject({ ...project, patents: project.patents.filter(p => p.id !== id) });
    setDeletingPatent(null);
    if (selectedPatent?.id === id) setSelectedPatent(null);
  };

  // ── CSV Import ──
  const [showCsvImport, setShowCsvImport] = useState(false);
  const handleCsvImport = (patents, mode) => {
    if (mode === "replace") {
      onUpdateProject({ ...project, patents });
    } else {
      onUpdateProject({ ...project, patents: [...project.patents, ...patents] });
    }
  };

  const saveName = () => {
    onUpdateProject({ ...project, name: projectName });
    setEditingName(false);
  };

  const totalPatents = project.patents.length;
  const grantedCount = project.patents.filter(p => p.status === "GRANTED").length;
  const activeCount = project.patents.filter(p => ["FILED", "PUBLISHED", "EXAMINING"].includes(p.status)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-lg transition" title="プロジェクト一覧に戻る">
              <ChevronRight size={18} className="text-gray-400 rotate-180" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-sm">💧</div>
            {editingName ? (
              <input value={projectName} onChange={e => setProjectName(e.target.value)} onBlur={saveName} onKeyDown={e => e.key === 'Enter' && saveName()}
                className="text-base font-bold text-gray-900 border-b-2 border-blue-400 outline-none bg-transparent" autoFocus />
            ) : (
              <h1 className="text-base font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition" onClick={() => setEditingName(true)}>
                {project.name} <Edit3 size={12} className="inline text-gray-400 ml-1" />
              </h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCsvImport(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1">
              <Upload size={13} /> CSVインポート
            </button>
            <button onClick={openCreatePatent}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1">
              <PlusCircle size={13} /> 特許追加
            </button>
            <button onClick={() => setShowStats(s => !s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${showStats ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}>
              <span className="flex items-center gap-1"><BarChart3 size={13} /> 統計</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-5">
        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <KpiCard title="特許総数" value={totalPatents} subtitle="プロジェクト内" icon={FileText} color="#1a5276" />
          <KpiCard title="登録済" value={grantedCount} subtitle={totalPatents ? `${Math.round(grantedCount / totalPatents * 100)}%` : "0%"} icon={CheckCircle2} color="#27ae60" />
          <KpiCard title="審査・出願中" value={activeCount} icon={Clock} color="#f39c12" />
          <KpiCard title="ブロック数" value={project.blocks.length} subtitle={`${project.connections.length} 接続`} icon={LayoutGrid} color="#2980b9" />
        </div>

        {showStats && <div className="mb-5"><StatsPanel patents={project.patents} /></div>}

        {/* Flow Editor + Palette */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4 mb-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Map size={16} className="text-blue-500" /> フローエディタ
                {selectedBlock && <span className="text-xs font-normal text-blue-500 ml-2">選択中: {selectedBlock.name}</span>}
              </h2>
              {selectedBlockId && (
                <button onClick={deleteBlock} className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded flex items-center gap-1">
                  <Trash2 size={12} /> ブロック削除
                </button>
              )}
            </div>
            <FlowEditorCanvas
              blocks={project.blocks}
              connections={project.connections}
              onBlocksChange={(newBlocks) => onUpdateProject({ ...project, blocks: newBlocks })}
              onConnectionsChange={(newConns) => onUpdateProject({ ...project, connections: newConns })}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              patents={project.patents}
            />
          </div>
          <BlockPalette onAddBlock={addBlock} />
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="特許番号・名称・出願人・IPC で検索..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter size={13} className="text-gray-400" />
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => toggleStatus(key)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition border`}
                  style={{ backgroundColor: statusFilter.includes(key) ? cfg.color : undefined, borderColor: cfg.color,
                    color: statusFilter.includes(key) ? "white" : cfg.color }}>
                  {cfg.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Globe size={13} className="text-gray-400" />
              {Object.entries(COUNTRIES).map(([code, info]) => (
                <button key={code} onClick={() => toggleCountry(code)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                    countryFilter.includes(code) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                  {info.flag} {code}
                </button>
              ))}
            </div>
            {(statusFilter.length > 0 || countryFilter.length > 0 || searchQuery) && (
              <button onClick={() => { setStatusFilter([]); setCountryFilter([]); setSearchQuery(""); }}
                className="px-3 py-1 rounded-lg text-xs text-red-500 hover:bg-red-50 flex items-center gap-1"><X size={12} /> クリア</button>
            )}
          </div>
        </div>

        {/* Selected block header */}
        {selectedBlock && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-500">表示中:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: selectedBlock.color || "#7f8c8d" }}>
              {BLOCK_TYPES.find(t => t.type === selectedBlock.type)?.icon} {selectedBlock.name}
              <button onClick={() => setSelectedBlockId(null)} className="ml-1 hover:opacity-70"><X size={14} /></button>
            </span>
            <span className="text-sm text-gray-400">({filteredPatents.length}件)</span>
          </div>
        )}

        {/* Patent List */}
        <div className="space-y-2.5">
          {filteredPatents.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Search size={40} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">条件に一致する特許が見つかりません</p>
              {!searchQuery && statusFilter.length === 0 && countryFilter.length === 0 && !selectedBlockType && (
                <button onClick={openCreatePatent} className="mt-3 text-blue-600 text-sm hover:underline">最初の特許を追加</button>
              )}
            </div>
          ) : filteredPatents.map(p => <PatentListItem key={p.id} patent={p} onClick={setSelectedPatent} onEdit={openEditPatent} onDelete={openDeletePatent} />)}
        </div>
        {filteredPatents.length > 0 && (
          <div className="text-center text-xs text-gray-400 mt-4">{filteredPatents.length} / {totalPatents} 件を表示中</div>
        )}
        <div className="mt-4 pb-8 px-2 text-xs text-gray-400 leading-relaxed">
          <p>※Note: The patent numbers and details shown here are for illustrative purposes only and do not represent actual patents.</p>
          <p>（注：ここに示されている特許番号および詳細は例示目的のみであり、実際の特許を表すものではありません。）</p>
        </div>
      </main>

      <PatentDetailModal patent={selectedPatent} onClose={() => setSelectedPatent(null)} onEdit={openEditPatent} />

      {/* Patent Form Modal (Create / Edit) */}
      {patentFormMode && (
        <PatentFormModal
          patent={patentFormMode === "edit" ? editingPatent : null}
          onSave={savePatent}
          onClose={() => { setPatentFormMode(null); setEditingPatent(null); }}
        />
      )}

      {/* Patent Delete Confirmation */}
      {deletingPatent && (
        <PatentDeleteConfirm
          patent={deletingPatent}
          onConfirm={confirmDeletePatent}
          onClose={() => setDeletingPatent(null)}
        />
      )}

      {/* CSV Import Modal */}
      {showCsvImport && (
        <CSVImportModal
          onImport={handleCsvImport}
          onClose={() => setShowCsvImport(false)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN APP - Project Management
// ═══════════════════════════════════════════════
function DialogOverlay({ children, onClose, size = "sm" }) {
  const maxW = size === "xl" ? "max-w-4xl" : size === "lg" ? "max-w-2xl" : size === "md" ? "max-w-lg" : "max-w-sm";
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className={`bg-white rounded-xl shadow-2xl p-6 mx-4 w-full ${maxW} max-h-[85vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("wpm_projects");
    if (saved) { try { return JSON.parse(saved); } catch { /* ignore */ } }
    return [createDefaultProject()];
  });
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("新規プロジェクト");
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("wpm_projects", JSON.stringify(projects));
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const createProject = () => {
    setNewProjectName("新規プロジェクト");
    setShowNewDialog(true);
  };

  const confirmCreate = () => {
    if (!newProjectName.trim()) return;
    const newProject = { id: uid(), name: newProjectName.trim(), description: "", field: "", createdAt: new Date().toISOString().slice(0, 10), blocks: [], connections: [], patents: [] };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setShowNewDialog(false);
  };

  const deleteProject = (id) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = () => {
    setProjects(prev => prev.filter(p => p.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  const duplicateProject = (id) => {
    const orig = projects.find(p => p.id === id);
    if (!orig) return;
    const dup = { ...JSON.parse(JSON.stringify(orig)), id: uid(), name: `${orig.name} (コピー)`, createdAt: new Date().toISOString().slice(0, 10) };
    setProjects(prev => [...prev, dup]);
  };

  const updateProject = (updated) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  if (activeProject) {
    return <ProjectDashboard project={activeProject} onUpdateProject={updateProject} onBack={() => setActiveProjectId(null)} />;
  }

  return (
    <>
      <ProjectListScreen
        projects={projects}
        onSelect={setActiveProjectId}
        onCreate={createProject}
        onDelete={deleteProject}
        onDuplicate={duplicateProject}
      />
      {showNewDialog && (
        <DialogOverlay onClose={() => setShowNewDialog(false)}>
          <h3 className="text-sm font-bold text-gray-900 mb-3">新規プロジェクト作成</h3>
          <input
            autoFocus
            type="text"
            value={newProjectName}
            onChange={e => setNewProjectName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && confirmCreate()}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            placeholder="プロジェクト名"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowNewDialog(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">キャンセル</button>
            <button onClick={confirmCreate} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">作成</button>
          </div>
        </DialogOverlay>
      )}
      {deleteTargetId && (
        <DialogOverlay onClose={() => setDeleteTargetId(null)}>
          <h3 className="text-sm font-bold text-gray-900 mb-2">プロジェクト削除</h3>
          <p className="text-sm text-gray-600 mb-4">このプロジェクトを削除しますか？この操作は取り消せません。</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeleteTargetId(null)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">キャンセル</button>
            <button onClick={confirmDelete} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">削除</button>
          </div>
        </DialogOverlay>
      )}
    </>
  );
}
