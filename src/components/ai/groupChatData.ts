export interface GroupMessage {
  id: string;
  sender: string;
  color: string;
  content: string;
  time: string;
  isMe?: boolean;
}

export interface ChatThread {
  id: string;
  type: "ai" | "alerts" | "group" | "border" | "rate";
  name: string;
  emoji: string;
  preview: string;
  time: string;
  unread: number;
  online?: boolean;
  messages: GroupMessage[];
  joinUrl?: string;
}

const COLORS = ["#06CF9C", "#FFB13B", "#53BDEB", "#FF6B6B", "#A78BFA", "#F472B6"];
const c = (i: number) => COLORS[i % COLORS.length];

export const THREADS: ChatThread[] = [
  {
    id: "ai", type: "ai", name: "ZimFreight Dispatch AI", emoji: "🤖",
    preview: "Online · Claude-powered", time: "now", unread: 0, online: true, messages: [],
  },
  {
    id: "alerts", type: "alerts", name: "Load Alerts", emoji: "📢",
    preview: "3 new loads on your routes", time: "12m", unread: 3,
    messages: [
      { id: "1", sender: "ZimFreight", color: c(0), time: "08:14", content: "🆕 *New load match* — Harare → Bulawayo, 32T flatbed, $1,300. Pickup tomorrow 06:00. Tap to view." },
      { id: "2", sender: "ZimFreight", color: c(0), time: "09:02", content: "🆕 *New load match* — Beit Bridge → Harare, 28T containers, $2,100. ZIMRA-cleared." },
      { id: "3", sender: "ZimFreight", color: c(0), time: "10:31", content: "💰 Rate alert — Harare → Mutare jumped to $3.20/km this morning. 4 active loads." },
    ],
  },
  {
    id: "harare-truckers", type: "group", name: "Harare Truckers Group", emoji: "👥",
    preview: "Tatenda: Load going BYO tomorrow...", time: "1h", unread: 5,
    joinUrl: "https://chat.whatsapp.com/zimfreight-harare",
    messages: [
      { id: "1", sender: "Tatenda M.", color: c(1), time: "07:42", content: "Morning team. Anyone running BYO tomorrow? Got 24T maize for Mahatshula." },
      { id: "2", sender: "Brian K.", color: c(2), time: "07:50", content: "I'm empty in Norton, can do it. What rate?" },
      { id: "3", sender: "Tatenda M.", color: c(1), time: "07:51", content: "$1,250 net. Pickup Workington 5am." },
      { id: "4", sender: "Munya", color: c(3), time: "08:03", content: "Watch for the police checkpoint past Kadoma — they're checking RMTs all week." },
      { id: "5", sender: "Brian K.", color: c(2), time: "08:05", content: "Confirmed Tatenda, sending RMT details now 👍" },
    ],
  },
  {
    id: "byo-network", type: "group", name: "Bulawayo Freight Network", emoji: "👥",
    preview: "New post: 20T maize available", time: "3h", unread: 2,
    joinUrl: "https://chat.whatsapp.com/zimfreight-byo",
    messages: [
      { id: "1", sender: "Sipho", color: c(4), time: "06:15", content: "20T white maize available BYO → Plumtree, $850. Need 10T tipper." },
      { id: "2", sender: "Lindiwe", color: c(5), time: "06:32", content: "I have a 30T rigid running empty back to BYO from Vic Falls Friday. Anyone needs?" },
    ],
  },
  {
    id: "zha", type: "group", name: "Zimbabwe Hauliers Association", emoji: "👥",
    preview: "Admin: New ZIMRA directive...", time: "5h", unread: 0,
    joinUrl: "https://chat.whatsapp.com/zha-official",
    messages: [
      { id: "1", sender: "ZHA Admin", color: c(0), time: "Yesterday", content: "📢 *New ZIMRA directive (eff. 1 Dec)*: All cross-border carriers must present updated Form 32 with EORI number for SADC consignments. Old forms accepted until 15 Dec." },
      { id: "2", sender: "Farai N.", color: c(1), time: "Yesterday", content: "Where do we apply for the EORI? Through ZIMRA portal or physical office?" },
      { id: "3", sender: "ZHA Admin", color: c(0), time: "Yesterday", content: "Online via the ZIMRA Asycuda portal — takes 3 working days. Document checklist in pinned message." },
    ],
  },
  {
    id: "beitbridge", type: "border", name: "Beit Bridge Updates", emoji: "🛃",
    preview: "Wait now 3h — avoid peak hours", time: "20m", unread: 0,
    messages: [
      { id: "1", sender: "Border Bot", color: c(2), time: "10:00", content: "🛃 *Beit Bridge update*\n• Northbound wait: 2h 50m\n• Southbound wait: 1h 20m\n• Peak: 8AM–2PM\n• Tip: cross between 4AM–6AM for under 30 min wait." },
      { id: "2", sender: "Driver Report", color: c(3), time: "10:14", content: "Just cleared southbound in 1h 5m. ZIMRA scanner working again ✅" },
    ],
  },
  {
    id: "rate-alerts", type: "rate", name: "Rate Alerts", emoji: "🔔",
    preview: "Harare→BYO rate up 5% this week", time: "2h", unread: 0,
    messages: [
      { id: "1", sender: "Rate Bot", color: c(4), time: "08:00", content: "📊 *Weekly rate movement*\n• HRE → BYO: $2.73/km ↑5%\n• HRE → Mutare: $3.04/km ↑2%\n• BB → HRE: $3.62/km → flat\n• HRE → JHB: $3.69/km ↓1%" },
    ],
  },
];

export const QUICK_ACTIONS = [
  "🚛 HRE→BYO loads",
  "💰 Rate check",
  "🛃 Border docs",
  "🗺 Route to JHB",
  "📋 ZIMRA help",
  "⛽ Fuel prices",
  "🔧 Breakdown near me",
  "📊 Rate forecast",
] as const;

export const QUICK_PROMPTS: Record<string, string> = {
  "🚛 HRE→BYO loads": "Show me available loads from Harare to Bulawayo this week with current rates.",
  "💰 Rate check": "What's the current going rate for Harare → Mutare for a 30T flatbed?",
  "🛃 Border docs": "Give me the full ZIMRA documentation checklist for crossing Beit Bridge southbound.",
  "🗺 Route to JHB": "Plan an optimal Harare → Johannesburg route via Beit Bridge with stopovers and fuel stops.",
  "📋 ZIMRA help": "Walk me through the ZIMRA Form 32 process for a cross-border tobacco shipment.",
  "⛽ Fuel prices": "What are current diesel prices in Harare, Bulawayo, and at Beit Bridge?",
  "🔧 Breakdown near me": "I've broken down on the A4 between Masvingo and Beitbridge. What recovery and parts options do I have nearby?",
  "📊 Rate forecast": "What's your forecast for cross-border rates to South Africa over the next two weeks?",
};