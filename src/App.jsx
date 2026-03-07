import { useState, useMemo, useCallback } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { Search, Filter, X, ChevronRight, ChevronDown, Globe, FileText, Download, BarChart3, Map, ArrowRight, Database, Calendar, Building2, Tag, ExternalLink, TrendingUp, CheckCircle2, Clock, AlertCircle, XCircle, MinusCircle, Eye } from "lucide-react";

// ═══════════════════════════════════════════════
// SAMPLE DATA
// ═══════════════════════════════════════════════
const PROCESS_STEPS = [
  { id: "PS01", num: 1, name: "取水", nameEn: "Raw Water Intake", color: "#3498db", icon: "💧", desc: "河川・湖沼・地下水から原水を取り込む" },
  { id: "PS02", num: 2, name: "凝集・フロック形成", nameEn: "Coagulation & Flocculation", color: "#9b59b6", icon: "🔬", desc: "凝集剤で微細粒子をフロックに成長" },
  { id: "PS03", num: 3, name: "沈殿", nameEn: "Sedimentation", color: "#e67e22", icon: "⏬", desc: "フロックを重力沈降させ上澄みを分離" },
  { id: "PS04", num: 4, name: "ろ過", nameEn: "Filtration", color: "#2ecc71", icon: "🧹", desc: "砂層・活性炭で残存粒子・有機物を除去" },
  { id: "PS05", num: 5, name: "消毒", nameEn: "Disinfection", color: "#1abc9c", icon: "🛡️", desc: "病原微生物を不活化し安全な水質を確保" },
  { id: "PS06", num: 6, name: "配水池・貯留", nameEn: "Storage & Distribution", color: "#e74c3c", icon: "🏗️", desc: "浄水を貯留し需要に応じて送水" },
  { id: "PS07", num: 7, name: "給水", nameEn: "Supply to Consumers", color: "#2980b9", icon: "🚰", desc: "家庭・事業所へ安全な水を供給" },
];

const SLUDGE_STEPS = [
  { id: "SL01", name: "汚泥濃縮", nameEn: "Thickening" },
  { id: "SL02", name: "脱水", nameEn: "Dewatering" },
  { id: "SL03", name: "乾燥・焼却", nameEn: "Drying/Incineration" },
  { id: "SL04", name: "最終処分・再利用", nameEn: "Disposal/Reuse" },
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
  JP: { name: "日本", flag: "🇯🇵" },
  US: { name: "米国", flag: "🇺🇸" },
  EP: { name: "欧州", flag: "🇪🇺" },
  CN: { name: "中国", flag: "🇨🇳" },
  KR: { name: "韓国", flag: "🇰🇷" },
  WO: { name: "PCT", flag: "🌐" },
};

// Generate realistic sample patents
const PATENTS = [
  { id: "P001", appNum: "JP2022-145678", title: "河川水の高効率取水装置及び取水方法", applicant: "水処理テクノロジー株式会社", filingDate: "2022-06-15", status: "GRANTED", country: "JP", ipc: "E02B 5/02", abstract: "河川水の取水効率を向上させるため、スクリーン構造を改良した取水装置。水位変動に対応可能な浮動式スクリーン機構を備える。", processes: ["PS01"], familyId: "F001", familyCount: 3, grantDate: "2024-03-10", expiryDate: "2042-06-15" },
  { id: "P002", appNum: "US2022/0312456", title: "Automated Water Quality Monitoring System for Intake", applicant: "AquaTech Inc.", filingDate: "2022-08-20", status: "EXAMINING", country: "US", ipc: "G01N 33/18", abstract: "AI-driven real-time water quality monitoring system for raw water intake, capable of detecting contaminants and adjusting intake parameters automatically.", processes: ["PS01"], familyId: "F002", familyCount: 2 },
  { id: "P003", appNum: "JP2021-098765", title: "新規ポリ塩化アルミニウム系凝集剤組成物", applicant: "化学工業株式会社", filingDate: "2021-03-22", status: "GRANTED", country: "JP", ipc: "C02F 1/52", abstract: "従来のPACに比べ低温水での凝集性能を大幅に改善した新規凝集剤組成物。フロック形成速度が約40%向上。", processes: ["PS02"], familyId: "F003", familyCount: 5, grantDate: "2023-11-05", expiryDate: "2041-03-22" },
  { id: "P004", appNum: "CN202210987654.3", title: "一种高效絮凝搅拌装置", applicant: "清华大学", filingDate: "2022-09-10", status: "PUBLISHED", country: "CN", ipc: "C02F 1/52", abstract: "高效率フロック形成のための新型撹拌装置。可変速度制御により最適なフロック径を実現。", processes: ["PS02"], familyId: "F004", familyCount: 1 },
  { id: "P005", appNum: "EP22185432.1", title: "Dual-polymer flocculant system for water treatment", applicant: "Veolia Water Technologies", filingDate: "2022-07-18", status: "EXAMINING", country: "EP", ipc: "C02F 1/54", abstract: "A dual-polymer flocculant system combining cationic and anionic polymers for enhanced floc formation in turbid water treatment.", processes: ["PS02"], familyId: "F005", familyCount: 4 },
  { id: "P006", appNum: "JP2023-034567", title: "傾斜板式沈殿池の改良構造", applicant: "日立造船株式会社", filingDate: "2023-02-14", status: "FILED", country: "JP", ipc: "B01D 21/02", abstract: "傾斜板の間隔と角度を最適化し、沈殿効率を従来比30%向上させた沈殿池構造。", processes: ["PS03"], familyId: "F006", familyCount: 1 },
  { id: "P007", appNum: "JP2020-178901", title: "高速沈殿処理システム及びその制御方法", applicant: "メタウォーター株式会社", filingDate: "2020-10-25", status: "GRANTED", country: "JP", ipc: "C02F 1/52", abstract: "マイクロサンド投入と機械撹拌を組合せた高速沈殿処理システム。処理時間を従来の1/3に短縮。", processes: ["PS03", "PS02"], familyId: "F007", familyCount: 6, grantDate: "2023-05-20", expiryDate: "2040-10-25" },
  { id: "P008", appNum: "US2023/0056789", title: "AI-Optimized Sedimentation Tank Control", applicant: "Xylem Inc.", filingDate: "2023-01-30", status: "EXAMINING", country: "US", ipc: "C02F 1/00", abstract: "Machine learning-based control system that optimizes sedimentation tank operations in real-time based on influent quality parameters.", processes: ["PS03"], familyId: "F008", familyCount: 3 },
  { id: "P009", appNum: "JP2021-156789", title: "多層ろ過装置及びろ過方法", applicant: "栗田工業株式会社", filingDate: "2021-09-28", status: "GRANTED", country: "JP", ipc: "B01D 24/00", abstract: "異なる粒径の砂層を多段配置したろ過装置。逆洗効率を大幅に改善し、ろ過水質を安定化。", processes: ["PS04"], familyId: "F009", familyCount: 4, grantDate: "2024-01-15", expiryDate: "2041-09-28" },
  { id: "P010", appNum: "JP2022-067890", title: "活性炭再生処理装置", applicant: "オルガノ株式会社", filingDate: "2022-04-12", status: "GRANTED", country: "JP", ipc: "C01B 32/39", abstract: "使用済み活性炭を高効率で再生する装置。再生率95%以上を実現し、ランニングコストを削減。", processes: ["PS04"], familyId: "F010", familyCount: 2, grantDate: "2024-08-22", expiryDate: "2042-04-12" },
  { id: "P011", appNum: "WO2023/045678", title: "Ceramic membrane filtration for water purification", applicant: "METAWATER Co., Ltd.", filingDate: "2023-03-15", status: "PUBLISHED", country: "WO", ipc: "B01D 61/14", abstract: "Novel ceramic membrane module with enhanced fouling resistance for direct filtration of surface water.", processes: ["PS04"], familyId: "F011", familyCount: 7 },
  { id: "P012", appNum: "KR10-2022-0123456", title: "나노여과막을 이용한 정수처리 시스템", applicant: "Samsung Engineering", filingDate: "2022-09-20", status: "GRANTED", country: "KR", ipc: "B01D 61/02", abstract: "ナノろ過膜を用いた高度浄水処理システム。微量有機物の除去率99%以上を達成。", processes: ["PS04"], familyId: "F012", familyCount: 3, grantDate: "2024-06-18", expiryDate: "2042-09-20" },
  { id: "P013", appNum: "JP2023-089012", title: "次亜塩素酸ナトリウム注入量の自動最適化システム", applicant: "横河電機株式会社", filingDate: "2023-05-20", status: "EXAMINING", country: "JP", ipc: "C02F 1/76", abstract: "リアルタイム水質モニタリングと機械学習を組合せた塩素注入量自動最適化システム。", processes: ["PS05"], familyId: "F013", familyCount: 2 },
  { id: "P014", appNum: "JP2020-234567", title: "紫外線消毒装置の省エネルギー制御方法", applicant: "パナソニック株式会社", filingDate: "2020-12-01", status: "GRANTED", country: "JP", ipc: "C02F 1/32", abstract: "UV-LED光源を用いた消毒装置の省エネルギー制御方法。従来UV灯に比べ消費電力を60%削減。", processes: ["PS05"], familyId: "F014", familyCount: 5, grantDate: "2023-09-10", expiryDate: "2040-12-01" },
  { id: "P015", appNum: "US2021/0234567", title: "Advanced Oxidation Process for Disinfection Byproduct Control", applicant: "Suez Water Technologies", filingDate: "2021-07-15", status: "GRANTED", country: "US", ipc: "C02F 1/72", abstract: "Combined ozone and hydrogen peroxide treatment system that minimizes disinfection byproduct formation while maintaining effective pathogen inactivation.", processes: ["PS05"], familyId: "F015", familyCount: 4, grantDate: "2024-02-28", expiryDate: "2041-07-15" },
  { id: "P016", appNum: "CN202310456789.X", title: "一种臭氧消毒的智能控制系统", applicant: "北京碧水源科技", filingDate: "2023-04-18", status: "FILED", country: "CN", ipc: "C02F 1/78", abstract: "オゾン消毒のインテリジェント制御システム。水質パラメータに基づくオゾン投入量の自動調整。", processes: ["PS05"], familyId: "F016", familyCount: 1 },
  { id: "P017", appNum: "JP2022-190123", title: "配水池の水質維持システム", applicant: "クボタ株式会社", filingDate: "2022-11-08", status: "EXAMINING", country: "JP", ipc: "E03B 11/00", abstract: "配水池内の残留塩素濃度を維持するための循環・追加塩素注入システム。", processes: ["PS06"], familyId: "F017", familyCount: 2 },
  { id: "P018", appNum: "JP2021-201234", title: "スマート配水管網の漏水検知方法", applicant: "NEC株式会社", filingDate: "2021-12-15", status: "GRANTED", country: "JP", ipc: "G01M 3/24", abstract: "AIによる配水管網の漏水位置推定技術。圧力センサデータの解析により漏水位置を高精度で特定。", processes: ["PS06", "PS07"], familyId: "F018", familyCount: 4, grantDate: "2024-04-05", expiryDate: "2041-12-15" },
  { id: "P019", appNum: "EP21198765.4", title: "Intelligent water distribution network optimization", applicant: "Siemens AG", filingDate: "2021-09-22", status: "GRANTED", country: "EP", ipc: "G05B 19/418", abstract: "Digital twin-based optimization system for water distribution networks, reducing energy consumption and water loss.", processes: ["PS06", "PS07"], familyId: "F019", familyCount: 6, grantDate: "2024-07-12", expiryDate: "2041-09-22" },
  { id: "P020", appNum: "JP2023-112345", title: "直結増圧給水装置の制御方法", applicant: "荏原製作所株式会社", filingDate: "2023-07-01", status: "FILED", country: "JP", ipc: "F04D 15/00", abstract: "需要予測に基づくポンプ運転制御により、直結増圧給水の省エネルギー化を実現。", processes: ["PS07"], familyId: "F020", familyCount: 1 },
  { id: "P021", appNum: "JP2022-078901", title: "IoTベース末端水質モニタリングシステム", applicant: "富士通株式会社", filingDate: "2022-05-10", status: "GRANTED", country: "JP", ipc: "G01N 33/18", abstract: "給水末端にIoTセンサを設置し、残留塩素・濁度をリアルタイム監視するシステム。", processes: ["PS07"], familyId: "F021", familyCount: 3, grantDate: "2024-09-01", expiryDate: "2042-05-10" },
  { id: "P022", appNum: "JP2021-145678", title: "汚泥濃縮における高分子凝集剤の最適添加方法", applicant: "水ing株式会社", filingDate: "2021-08-30", status: "GRANTED", country: "JP", ipc: "C02F 11/14", abstract: "汚泥濃縮工程での高分子凝集剤添加量をリアルタイムで最適化する方法。薬品コスト20%削減。", processes: ["SL01"], familyId: "F022", familyCount: 2, grantDate: "2024-02-15", expiryDate: "2041-08-30" },
  { id: "P023", appNum: "JP2023-056789", title: "省エネ型スクリュープレス脱水機", applicant: "月島JFEアクアソリューション", filingDate: "2023-03-25", status: "EXAMINING", country: "JP", ipc: "B01D 33/00", abstract: "スクリュープレスの回転制御を改良し、脱水ケーキの含水率を低減しつつ消費電力を30%削減。", processes: ["SL02"], familyId: "F023", familyCount: 1 },
  { id: "P024", appNum: "US2022/0198765", title: "Low-Temperature Sludge Drying System", applicant: "Andritz AG", filingDate: "2022-06-20", status: "GRANTED", country: "US", ipc: "C02F 11/12", abstract: "A low-temperature belt drying system for municipal sludge utilizing waste heat recovery, achieving 90% moisture reduction.", processes: ["SL03"], familyId: "F024", familyCount: 5, grantDate: "2024-10-15", expiryDate: "2042-06-20" },
  { id: "P025", appNum: "JP2022-212345", title: "浄水汚泥の建設資材としての再利用方法", applicant: "太平洋セメント株式会社", filingDate: "2022-12-10", status: "PUBLISHED", country: "JP", ipc: "C04B 18/04", abstract: "浄水場発生汚泥をセメント原料として有効利用する技術。汚泥の乾燥・前処理方法を含む。", processes: ["SL04"], familyId: "F025", familyCount: 2 },
  { id: "P026", appNum: "WO2022/078901", title: "Electrocoagulation system for water treatment", applicant: "BOREAS Water Tech", filingDate: "2022-04-05", status: "EXPIRED", country: "WO", ipc: "C02F 1/46", abstract: "An electrocoagulation reactor with self-cleaning electrodes for removal of heavy metals and suspended solids from raw water.", processes: ["PS02", "PS03"], familyId: "F026", familyCount: 3 },
  { id: "P027", appNum: "JP2019-098765", title: "浄水場統合制御システム", applicant: "東芝インフラシステムズ", filingDate: "2019-05-15", status: "EXPIRED", country: "JP", ipc: "G05B 19/418", abstract: "取水から配水までの全工程を統合制御するSCADAシステム。異常時の自動対応機能を搭載。", processes: ["PS01", "PS02", "PS03", "PS04", "PS05", "PS06", "PS07"], familyId: "F027", familyCount: 4, grantDate: "2022-01-20", expiryDate: "2025-05-15" },
  { id: "P028", appNum: "CN202110345678.9", title: "一种新型混凝沉淀一体化装置", applicant: "同济大学", filingDate: "2021-04-01", status: "GRANTED", country: "CN", ipc: "C02F 1/52", abstract: "凝集と沈殿を一体化した装置。省スペースで高効率な水処理を実現。", processes: ["PS02", "PS03"], familyId: "F028", familyCount: 2, grantDate: "2023-08-10", expiryDate: "2041-04-01" },
  { id: "P029", appNum: "JP2023-167890", title: "オゾン・活性炭併用型高度浄水処理方法", applicant: "東京都水道局", filingDate: "2023-10-05", status: "FILED", country: "JP", ipc: "C02F 1/78", abstract: "オゾン処理と生物活性炭処理を最適に組み合わせた高度浄水処理方法。", processes: ["PS04", "PS05"], familyId: "F029", familyCount: 1 },
  { id: "P030", appNum: "KR10-2023-0045678", title: "막여과 공정의 파울링 예측 시스템", applicant: "LG Chem", filingDate: "2023-04-10", status: "EXAMINING", country: "KR", ipc: "B01D 65/10", abstract: "膜ろ過プロセスのファウリングをAIで予測するシステム。メンテナンス時期の最適化。", processes: ["PS04"], familyId: "F030", familyCount: 2 },
];

// Trend data
const TREND_DATA = [
  { year: "2019", count: 2 }, { year: "2020", count: 3 }, { year: "2021", count: 6 },
  { year: "2022", count: 10 }, { year: "2023", count: 9 },
];

// ═══════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════
function getPatentsForProcess(processId) {
  return PATENTS.filter(p => p.processes.includes(processId));
}

function StatusBadge({ status, size = "sm" }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;
  const Icon = cfg.icon;
  const sz = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${sz}`}
      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      <Icon size={size === "sm" ? 12 : 14} />
      {cfg.label}
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

// ═══════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════

// KPI Card
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

// Flow Node
function FlowNode({ step, patentCount, isSelected, onClick, statusBreakdown }) {
  const grantedCount = statusBreakdown.GRANTED || 0;
  const examCount = (statusBreakdown.EXAMINING || 0) + (statusBreakdown.FILED || 0) + (statusBreakdown.PUBLISHED || 0);
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-200 border-2 ${
        isSelected ? "shadow-lg scale-105" : "shadow-sm hover:shadow-md hover:scale-102"
      }`}
      style={{
        borderColor: isSelected ? step.color : `${step.color}40`,
        backgroundColor: isSelected ? `${step.color}10` : "white",
        minWidth: 160,
      }}
    >
      {/* Patent count badge */}
      <div
        className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
        style={{ backgroundColor: step.color }}
      >
        {patentCount}
      </div>

      <div className="text-center">
        <div className="text-2xl mb-1">{step.icon}</div>
        <div className="text-xs font-medium uppercase tracking-wider mb-0.5" style={{ color: step.color }}>
          Step {String(step.num).padStart(2, "0")}
        </div>
        <div className="font-bold text-gray-800 text-sm leading-tight">{step.name}</div>
        <div className="text-xs text-gray-400 mt-0.5">{step.nameEn}</div>
      </div>

      {/* Mini status bar */}
      <div className="mt-3 flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-gray-100">
        {grantedCount > 0 && (
          <div style={{ width: `${(grantedCount / patentCount) * 100}%`, backgroundColor: STATUS_CONFIG.GRANTED.color }} />
        )}
        {examCount > 0 && (
          <div style={{ width: `${(examCount / patentCount) * 100}%`, backgroundColor: STATUS_CONFIG.EXAMINING.color }} />
        )}
        {(statusBreakdown.EXPIRED || 0) > 0 && (
          <div style={{ width: `${((statusBreakdown.EXPIRED || 0) / patentCount) * 100}%`, backgroundColor: STATUS_CONFIG.EXPIRED.color }} />
        )}
      </div>
    </div>
  );
}

// Arrow between nodes
function FlowArrow() {
  return (
    <div className="flex items-center justify-center px-1">
      <ArrowRight size={20} className="text-gray-300" />
    </div>
  );
}

// Patent list item
function PatentListItem({ patent, onClick }) {
  return (
    <div
      onClick={() => onClick(patent)}
      className="p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="text-sm font-semibold text-gray-800 leading-snug flex-1">{patent.title}</div>
        <StatusBadge status={patent.status} />
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><FileText size={11} />{patent.appNum}</span>
        <CountryFlag code={patent.country} />
        <span className="flex items-center gap-1"><Building2 size={11} />{patent.applicant}</span>
      </div>
      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Calendar size={11} />{patent.filingDate}</span>
        <span className="flex items-center gap-1"><Tag size={11} />{patent.ipc}</span>
        {patent.familyCount > 1 && (
          <span className="flex items-center gap-1"><Globe size={11} />ファミリー {patent.familyCount}件</span>
        )}
      </div>
    </div>
  );
}

// Patent detail modal
function PatentDetailModal({ patent, onClose }) {
  if (!patent) return null;
  const remainYears = patent.expiryDate
    ? Math.max(0, Math.round((new Date(patent.expiryDate) - new Date()) / (365.25 * 24 * 60 * 60 * 1000)))
    : null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={patent.status} size="md" />
                <CountryFlag code={patent.country} showName />
              </div>
              <h2 className="text-lg font-bold text-gray-900 leading-snug">{patent.title}</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              ["出願番号", patent.appNum, FileText],
              ["出願人", patent.applicant, Building2],
              ["出願日", patent.filingDate, Calendar],
              ["IPC分類", patent.ipc, Tag],
              ...(patent.grantDate ? [["登録日", patent.grantDate, CheckCircle2]] : []),
              ...(patent.expiryDate ? [["満了日", patent.expiryDate, Clock]] : []),
            ].map(([label, value, Icon], i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                <Icon size={14} className="text-gray-400 shrink-0" />
                <div>
                  <div className="text-xs text-gray-400">{label}</div>
                  <div className="text-sm font-medium text-gray-700">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Remaining years */}
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

          {/* Abstract */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-1.5">要約</h3>
            <p className="text-sm text-gray-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg">{patent.abstract}</p>
          </div>

          {/* Related processes */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1.5">関連工程</h3>
            <div className="flex flex-wrap gap-2">
              {patent.processes.map(pid => {
                const step = [...PROCESS_STEPS, ...SLUDGE_STEPS.map((s, i) => ({...s, color: "#7f8c8d"}))].find(s => s.id === pid);
                return step ? (
                  <span key={pid} className="px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: step.color || "#7f8c8d" }}>
                    {step.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          {/* Patent family */}
          {patent.familyCount > 1 && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-purple-500" />
                <span className="text-sm font-medium text-purple-800">
                  パテントファミリー: {patent.familyCount}件 (ID: {patent.familyId})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Statistics panel
function StatsPanel({ patents }) {
  const statusData = useMemo(() =>
    Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
      name: cfg.label, value: patents.filter(p => p.status === key).length, color: cfg.color,
    })).filter(d => d.value > 0),
    [patents]
  );

  const countryData = useMemo(() =>
    Object.entries(COUNTRIES).map(([code, info]) => ({
      name: `${info.flag} ${info.name}`, value: patents.filter(p => p.country === code).length,
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value),
    [patents]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Status pie */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <BarChart3 size={16} className="text-blue-500" /> 権利化状態別
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={2}>
              {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [`${v}件`, n]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 mt-1 justify-center">
          {statusData.map((d, i) => (
            <span key={i} className="text-xs flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: d.color }} />
              {d.name} ({d.value})
            </span>
          ))}
        </div>
      </div>

      {/* Country bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Globe size={16} className="text-green-500" /> 出願国別
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={countryData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v}件`]} />
            <Bar dataKey="value" fill="#3498db" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend line */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-orange-500" /> 出願トレンド
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={TREND_DATA} margin={{ left: -10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v}件`, "出願数"]} />
            <Line type="monotone" dataKey="count" stroke="#e67e22" strokeWidth={2.5} dot={{ fill: "#e67e22", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════
export default function App() {
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [selectedPatent, setSelectedPatent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [countryFilter, setCountryFilter] = useState([]);
  const [showStats, setShowStats] = useState(true);
  const [view, setView] = useState("flow"); // "flow" | "table"

  // Compute per-process stats
  const processStats = useMemo(() => {
    const stats = {};
    PROCESS_STEPS.forEach(step => {
      const patents = getPatentsForProcess(step.id);
      const breakdown = {};
      patents.forEach(p => { breakdown[p.status] = (breakdown[p.status] || 0) + 1; });
      stats[step.id] = { count: patents.length, breakdown };
    });
    SLUDGE_STEPS.forEach(step => {
      const patents = getPatentsForProcess(step.id);
      stats[step.id] = { count: patents.length, breakdown: {} };
    });
    return stats;
  }, []);

  // Filtered patents for the selected process panel
  const filteredPatents = useMemo(() => {
    let result = selectedProcess
      ? PATENTS.filter(p => p.processes.includes(selectedProcess))
      : PATENTS;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.appNum.toLowerCase().includes(q) ||
        p.applicant.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.ipc.toLowerCase().includes(q)
      );
    }
    if (statusFilter.length > 0) {
      result = result.filter(p => statusFilter.includes(p.status));
    }
    if (countryFilter.length > 0) {
      result = result.filter(p => countryFilter.includes(p.country));
    }
    return result;
  }, [selectedProcess, searchQuery, statusFilter, countryFilter]);

  const toggleStatus = (s) => setStatusFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleCountry = (c) => setCountryFilter(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const totalPatents = PATENTS.length;
  const grantedCount = PATENTS.filter(p => p.status === "GRANTED").length;
  const activeCount = PATENTS.filter(p => ["FILED", "PUBLISHED", "EXAMINING"].includes(p.status)).length;
  const countriesCount = new Set(PATENTS.map(p => p.country)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20">
      {/* ──── Header ──── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-lg">💧</div>
            <div>
              <h1 className="text-base font-bold text-gray-900">水処理特許マッピングシステム</h1>
              <p className="text-xs text-gray-400">Patent Mapping for Water Treatment Process</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("flow")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${view === "flow" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <span className="flex items-center gap-1"><Map size={13} /> フロー図</span>
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${view === "table" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <span className="flex items-center gap-1"><Database size={13} /> 一覧</span>
            </button>
            <button
              onClick={() => setShowStats(s => !s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${showStats ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <span className="flex items-center gap-1"><BarChart3 size={13} /> 統計</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-5">
        {/* ──── KPI Cards ──── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <KpiCard title="特許総数" value={totalPatents} subtitle="全工程合計" icon={FileText} color="#1a5276" />
          <KpiCard title="登録済" value={grantedCount} subtitle={`${Math.round(grantedCount/totalPatents*100)}% of total`} icon={CheckCircle2} color="#27ae60" />
          <KpiCard title="審査・出願中" value={activeCount} subtitle="活動中の出願" icon={Clock} color="#f39c12" />
          <KpiCard title="出願国数" value={countriesCount} subtitle="JP, US, EP, CN, KR, WO" icon={Globe} color="#2980b9" />
        </div>

        {/* ──── Stats Panel ──── */}
        {showStats && (
          <div className="mb-5">
            <StatsPanel patents={PATENTS} />
          </div>
        )}

        {/* ──── Flow Diagram ──── */}
        {view === "flow" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
            <h2 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
              <Map size={16} className="text-blue-500" />
              水処理プロセスフロー図
              <span className="text-xs font-normal text-gray-400 ml-2">（工程をクリックして特許を表示）</span>
            </h2>

            {/* Main flow */}
            <div className="flex items-center justify-center gap-1 overflow-x-auto pb-4 px-2" style={{ minHeight: 180 }}>
              {PROCESS_STEPS.map((step, i) => (
                <div key={step.id} className="flex items-center">
                  <FlowNode
                    step={step}
                    patentCount={processStats[step.id]?.count || 0}
                    statusBreakdown={processStats[step.id]?.breakdown || {}}
                    isSelected={selectedProcess === step.id}
                    onClick={() => setSelectedProcess(selectedProcess === step.id ? null : step.id)}
                  />
                  {i < PROCESS_STEPS.length - 1 && <FlowArrow />}
                </div>
              ))}
            </div>

            {/* Sludge line */}
            <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
              <div className="text-xs font-medium text-gray-400 mb-2.5 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs">↓</span>
                汚泥処理ライン（沈殿・ろ過工程より発生）
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 pl-4">
                {SLUDGE_STEPS.map((step, i) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      onClick={() => setSelectedProcess(selectedProcess === step.id ? null : step.id)}
                      className={`cursor-pointer px-4 py-2.5 rounded-xl border-2 transition-all text-center min-w-[120px] ${
                        selectedProcess === step.id
                          ? "border-gray-500 bg-gray-100 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="text-sm font-semibold text-gray-700">{step.name}</div>
                      <div className="text-xs text-gray-400">{step.nameEn}</div>
                      {(processStats[step.id]?.count || 0) > 0 && (
                        <div className="mt-1 text-xs font-bold text-gray-500">{processStats[step.id].count}件</div>
                      )}
                    </div>
                    {i < SLUDGE_STEPS.length - 1 && (
                      <ArrowRight size={16} className="text-gray-300 mx-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ──── Filter Bar ──── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="特許番号・名称・出願人・IPC で検索..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>

            {/* Status filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter size={13} className="text-gray-400" />
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => toggleStatus(key)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition border ${
                    statusFilter.includes(key) ? "text-white" : "bg-white"
                  }`}
                  style={{
                    backgroundColor: statusFilter.includes(key) ? cfg.color : undefined,
                    borderColor: cfg.color,
                    color: statusFilter.includes(key) ? "white" : cfg.color,
                  }}
                >
                  {cfg.label}
                </button>
              ))}
            </div>

            {/* Country filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Globe size={13} className="text-gray-400" />
              {Object.entries(COUNTRIES).map(([code, info]) => (
                <button
                  key={code}
                  onClick={() => toggleCountry(code)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                    countryFilter.includes(code)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {info.flag} {code}
                </button>
              ))}
            </div>

            {/* Clear filters */}
            {(statusFilter.length > 0 || countryFilter.length > 0 || searchQuery) && (
              <button
                onClick={() => { setStatusFilter([]); setCountryFilter([]); setSearchQuery(""); }}
                className="px-3 py-1 rounded-lg text-xs text-red-500 hover:bg-red-50 transition flex items-center gap-1"
              >
                <X size={12} /> クリア
              </button>
            )}
          </div>
        </div>

        {/* ──── Selected process header ──── */}
        {selectedProcess && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-500">表示中:</span>
            {(() => {
              const step = [...PROCESS_STEPS, ...SLUDGE_STEPS].find(s => s.id === selectedProcess);
              return step ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: step.color || "#7f8c8d" }}>
                  {step.name}
                  <button onClick={() => setSelectedProcess(null)} className="ml-1 hover:opacity-70"><X size={14} /></button>
                </span>
              ) : null;
            })()}
            <span className="text-sm text-gray-400">({filteredPatents.length}件)</span>
          </div>
        )}

        {/* ──── Patent List ──── */}
        <div className="space-y-2.5">
          {filteredPatents.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Search size={40} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">条件に一致する特許が見つかりません</p>
              <p className="text-xs mt-1">フィルタ条件を変更してください</p>
            </div>
          ) : (
            filteredPatents.map(patent => (
              <PatentListItem key={patent.id} patent={patent} onClick={setSelectedPatent} />
            ))
          )}
        </div>

        {/* ──── Results count ──── */}
        {filteredPatents.length > 0 && (
          <div className="text-center text-xs text-gray-400 mt-4 pb-8">
            {filteredPatents.length} / {totalPatents} 件を表示中
          </div>
        )}
      </main>

      {/* ──── Patent Detail Modal ──── */}
      <PatentDetailModal patent={selectedPatent} onClose={() => setSelectedPatent(null)} />
    </div>
  );
}
