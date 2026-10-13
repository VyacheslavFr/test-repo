/**
 * Onix Barbershop — лендинг премиального барбершопа.
 *
 * Один React-компонент: React 18, Tailwind CSS, Framer Motion 11,
 * GSAP 3 + ScrollTrigger (скролл-сцены) и Lucide React (иконки).
 * Шрифты подключаются из Google Fonts внутри <GlobalStyles />.
 */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  Crown,
  Droplets,
  Flame,
  Gem,
  Layers,
  MapPin,
  Menu,
  PenTool,
  Phone,
  Plus,
  ScanFace,
  Scissors,
  Send,
  Star,
  Wind,
  X,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ───────────────────────────── Данные ───────────────────────────── */

const ADDRESS = "Гомель, ул. Румянцевская, 21";
const PHONE = "+375 (29) 000-24-24";
const TELEGRAM = "@onix_barber";

const SERVICES = [
  {
    id: "signature",
    icon: Scissors,
    cat: "Стрижка",
    title: "Стрижка «Onix»",
    price: 55,
    time: 60,
    tool: "Ножницы и машинка",
    badge: "Фирменная",
    desc: "Консультация, мытьё, работа ножницами и машинкой, укладка премиальной косметикой.",
    includes: ["Консультация по форме головы", "Мытьё и массаж кожи головы", "Стрижка и укладка", "Горячее полотенце на финише"],
  },
  {
    id: "shave",
    icon: Crown,
    cat: "Бритьё",
    title: "Королевское бритьё",
    price: 45,
    time: 45,
    tool: "Опасная бритва",
    desc: "Три горячих полотенца, бритьё опасной бритвой в два прохода, холодный компресс.",
    includes: ["Распаривание кожи", "Пена ручного взбивания", "Два прохода бритвой", "Холодный компресс и бальзам"],
  },
  {
    id: "fade",
    icon: Layers,
    cat: "Стрижка",
    title: "Скин-фейд",
    price: 50,
    time: 60,
    tool: "Насадки 0,5–3 мм",
    desc: "Растушёвка от кожи без видимых ступеней. Контур и финиш опасной бритвой.",
    includes: ["Переход от 0 мм", "Проработка затылка и макушки", "Контур опасной бритвой", "Укладка"],
  },
  {
    id: "beard",
    icon: PenTool,
    cat: "Борода",
    title: "Борода и контур",
    price: 30,
    time: 40,
    tool: "Триммер и бритва",
    desc: "Форма под овал лица, чёткий контур опасной бритвой, масло и бальзам для кожи.",
    includes: ["Подбор формы", "Моделирование триммером", "Контур опасной бритвой", "Масло и бальзам"],
  },
  {
    id: "grey",
    icon: Droplets,
    cat: "Уход",
    title: "Камуфляж седины",
    price: 30,
    time: 30,
    tool: "Тонирование",
    desc: "Тонирование, которое скрывает до 70 % седины и выглядит естественно при любом свете.",
    includes: ["Подбор оттенка", "Выдержка 10 минут", "Мытьё и кондиционер", "Держится до 6 недель"],
  },
  {
    id: "ritual",
    icon: Gem,
    cat: "Комплекс",
    title: "Полный ритуал",
    price: 110,
    time: 120,
    tool: "Стрижка + бритьё",
    desc: "Стрижка «Onix», королевское бритьё и уход за кожей лица за один визит.",
    includes: ["Стрижка «Onix»", "Королевское бритьё", "Маска и пилинг", "Напиток из бара"],
  },
];

const RITUAL = [
  {
    n: "01",
    icon: ScanFace,
    title: "Консультация",
    min: 5,
    text: "Мастер смотрит на форму головы, рост волос и то, как вы обычно укладываетесь. Результат обсуждаем до первого щелчка ножниц.",
  },
  {
    n: "02",
    icon: Droplets,
    title: "Мытьё и массаж",
    min: 10,
    text: "Шампунь под тип кожи головы и массаж. Чистые волосы ложатся по своему естественному направлению.",
  },
  { n: "03", icon: Scissors, title: "Стрижка", min: 35, text: "Ножницы, машинка, бритва по контуру. Работаем столько, сколько требует форма." },
  { n: "04", icon: Flame, title: "Горячее полотенце", min: 5, text: "Полотенце при 60 °C раскрывает поры и снимает раздражение после бритвы." },
  { n: "05", icon: Wind, title: "Укладка", min: 5, text: "Подбираем средство и показываем, как повторить укладку дома за две минуты." },
];

const MASTERS = [
  {
    id: "volkov",
    name: "Артём Волков",
    role: "Основатель · арт-директор",
    years: 14,
    tool: "Ножницы",
    mark: "АВ",
    seed: 3,
    photo: null,
    quote: "Ножницы прощают меньше, чем машинка. Поэтому я с ними и работаю.",
  },
  {
    id: "severin",
    name: "Марк Северин",
    role: "Мастер фейдов",
    years: 9,
    tool: "Машинка, 0,5–3 мм",
    mark: "МС",
    seed: 11,
    photo: null,
    quote: "Переход хорош, когда ступень не видна даже при дневном свете.",
  },
  {
    id: "aliev",
    name: "Тимур Алиев",
    role: "Мастер бритья",
    years: 11,
    tool: "Опасная бритва",
    mark: "ТА",
    seed: 23,
    photo: null,
    quote: "Бритьё начинается с горячего полотенца. Бритва идёт последней.",
  },
  {
    id: "orlov",
    name: "Лев Орлов",
    role: "Стилист бороды",
    years: 7,
    tool: "Триммер и гребень",
    mark: "ЛО",
    seed: 37,
    photo: null,
    quote: "Борода меняет пропорции лица сильнее, чем стрижка.",
  },
];

const TIMES = Array.from({ length: 12 }, (_, i) => `${10 + i}:00`);
const NAV = [
  { id: "craft", label: "Ремесло" },
  { id: "ritual", label: "Ритуал" },
  { id: "masters", label: "Мастера" },
  { id: "booking", label: "Контакты" },
];

/* ──────────────────────────── Утилиты ──────────────────────────── */

const fmtPrice = (n) => `${n.toLocaleString("ru-RU")} BYN`;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const wrap = (min, max, v) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};
const mulberry32 = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
/** Маска белорусского номера: +375 (29) 123-45-67. */
const formatPhone = (raw) => {
  let d = raw.replace(/\D/g, "");
  if (!d) return "";
  if ("375".startsWith(d)) return `+${d}`;
  if (d.startsWith("80") && d.length >= 11) d = `375${d.slice(2)}`;
  else if (!d.startsWith("375")) d = `375${d}`;
  const p = d.slice(3, 12);
  let out = "+375";
  if (p.length) out += ` (${p.slice(0, 2)}`;
  if (p.length > 2) out += `) ${p.slice(2, 5)}`;
  if (p.length > 5) out += `-${p.slice(5, 7)}`;
  if (p.length > 7) out += `-${p.slice(7, 9)}`;
  return out;
};
const isBusy = (dayIdx, slotIdx, masterKey) => {
  if (dayIdx === 0 && 10 + slotIdx <= new Date().getHours()) return true;
  return (dayIdx * 5 + slotIdx * 7 + masterKey * 3) % 6 === 0 || (dayIdx * 3 + slotIdx + masterKey) % 7 === 0;
};
const buildDays = () => {
  const now = new Date();
  const wd = new Intl.DateTimeFormat("ru-RU", { weekday: "short" });
  const mon = new Intl.DateTimeFormat("ru-RU", { month: "short" });
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    return {
      key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
      label: i === 0 ? "Сегодня" : i === 1 ? "Завтра" : wd.format(d),
      day: d.getDate(),
      month: mon.format(d).replace(".", ""),
      long: new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }).format(d),
    };
  });
};

const springSoft = { type: "spring", stiffness: 70, damping: 17, mass: 0.9 };
const springSnappy = { type: "spring", stiffness: 380, damping: 28 };
const EASE_CUT = [0.76, 0, 0.24, 1];

function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return fine;
}

/* ──────────────────────── Глобальные стили ─────────────────────── */

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Sofia+Sans+Extra+Condensed:ital,wght@0,600;0,700;0,800;1,600;1,700;1,800&family=Sofia+Sans+Semi+Condensed:wght@500;600;700&family=Golos+Text:wght@400;500;600&display=swap";

const GRAIN =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>";

const GLOBAL_CSS = `
@import url('${FONTS_URL}');
/* Светлая «интерьерная» гамма: штукатурка, бумага, зелёный оникс, графит, коньячная кожа. */
:root { color-scheme: light; --stone: #ECEDE8; --paper: #F7F7F3; --ink: #1D2622; --onyx: #2E5E4E; --onyx-hi: #4E8A72; --leather: #9A6440; }
html, body { background: var(--stone); color: var(--ink); }
body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
.f-body { font-family: 'Golos Text', 'Segoe UI', system-ui, -apple-system, sans-serif; }
.f-display { font-family: 'Sofia Sans Extra Condensed', 'Roboto Condensed', 'Arial Narrow', sans-serif; font-variant-numeric: lining-nums; }
.f-label { font-family: 'Sofia Sans Semi Condensed', 'Roboto Condensed', 'Arial Narrow', sans-serif; font-weight: 600; }
.stroke-text { color: transparent; -webkit-text-stroke: 1.5px rgba(46, 94, 78, 0.16); }
.accent-text { background: linear-gradient(180deg, #4E8A72 0%, #2E5E4E 45%, #1D2622 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.grain { position: fixed; inset: -100%; width: 300%; height: 300%; z-index: 90; pointer-events: none; opacity: 0.1; mix-blend-mode: multiply; background-image: url("${GRAIN}"); animation: gr-grain 0.9s steps(5) infinite; }
@keyframes gr-grain { 0% { transform: translate(0, 0) } 20% { transform: translate(-4%, 3%) } 40% { transform: translate(3%, -5%) } 60% { transform: translate(-6%, -2%) } 80% { transform: translate(5%, 4%) } 100% { transform: translate(0, 0) } }
::selection { background: var(--onyx); color: var(--paper); }
:focus-visible { outline: 2px solid var(--onyx); outline-offset: 4px; }
html.gr-cursor, html.gr-cursor * { cursor: none !important; }
html.gr-cursor input, html.gr-cursor textarea { cursor: text !important; }
input::placeholder { color: rgba(29, 38, 34, 0.38); }
@media (prefers-reduced-motion: reduce) { .grain { animation: none; } }
`;

function GlobalStyles() {
  return <style>{GLOBAL_CSS}</style>;
}

/** Общие SVG-градиенты для чертежа бритвы. */
function SvgDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gr-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5E5E5C" />
          <stop offset="0.16" stopColor="#D9D8D3" />
          <stop offset="0.42" stopColor="#7E7D79" />
          <stop offset="0.7" stopColor="#ECEBE6" />
          <stop offset="0.9" stopColor="#B9B7B0" />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
        <linearGradient id="gr-horn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7A5539" />
          <stop offset="0.35" stopColor="#5A3D28" />
          <stop offset="0.75" stopColor="#3F2B1D" />
          <stop offset="1" stopColor="#6B4A32" />
        </linearGradient>
        <linearGradient id="gr-nickel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8D9590" />
          <stop offset="0.45" stopColor="#EEF1EF" />
          <stop offset="1" stopColor="#A7AFAA" />
        </linearGradient>
        <radialGradient id="gr-glow">
          <stop offset="0" stopColor="#2E5E4E" stopOpacity="0.1" />
          <stop offset="1" stopColor="#2E5E4E" stopOpacity="0" />
        </radialGradient>
        <pattern id="gr-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1D2622" strokeOpacity="0.07" strokeWidth="0.5" />
        </pattern>
      </defs>
    </svg>
  );
}

/* ─────────────────────── Базовые примитивы ─────────────────────── */

/** Побуквенное появление заголовка: пружина + поворот по X. */
function SplitLetters({ text, play = true, trigger, delay = 0, stagger = 0.035, letterClassName = "" }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  const go = trigger === "view" ? seen : play;
  let index = 0;
  return (
    <span ref={ref} aria-hidden="true">
      {text.split(" ").map((word, wi, arr) => (
        <React.Fragment key={wi}>
          <span
            className="-mx-[0.05em] -mb-[0.16em] -mt-[0.08em] inline-block overflow-hidden whitespace-nowrap px-[0.05em] pb-[0.16em] pt-[0.08em] align-bottom"
            style={{ perspective: 700 }}
          >
            {[...word].map((ch) => {
              const i = index++;
              return (
                <motion.span
                  key={i}
                  className={`inline-block ${letterClassName}`}
                  style={{ transformOrigin: "50% 100%" }}
                  initial={{ y: "118%", rotateX: -75, rotate: 7 }}
                  animate={go ? { y: "0%", rotateX: 0, rotate: 0 } : undefined}
                  transition={{ type: "spring", stiffness: 130, damping: 15, mass: 0.7, delay: delay + i * stagger }}
                >
                  {ch}
                </motion.span>
              );
            })}
          </span>
          {wi < arr.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </span>
  );
}

/** Появление блока при скролле на пружинной физике. */
function Reveal({ children, delay = 0, y = 70, className = "", as = "div" }) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y, rotateX: -14, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ ...springSoft, delay }}
      style={{ transformPerspective: 1000, transformOrigin: "50% 0%" }}
    >
      {children}
    </M>
  );
}

function Magnetic({ children, strength = 0.35, className = "" }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 15, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

function PrimaryButton({ children, onClick, type = "button", className = "" }) {
  return (
    <Magnetic>
      <motion.button
        type={type}
        onClick={onClick}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileTap={{ scale: 0.96 }}
        className={`f-label relative inline-flex items-center gap-3 overflow-hidden bg-[#2E5E4E] px-7 py-4 text-[13px] font-medium uppercase tracking-[0.2em] text-[#F7F7F3] shadow-[0_0_0_rgba(46,94,78,0)] ${className}`}
        variants={{ rest: { boxShadow: "0 0 0px rgba(46,94,78,0)" }, hover: { boxShadow: "0 0 50px rgba(46,94,78,0.45)" } }}
      >
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 bg-[#1D2622]"
          variants={{ rest: { y: "101%" }, hover: { y: "0%" } }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        />
        <span className="relative">{children}</span>
        <motion.span className="relative" variants={{ rest: { rotate: 0 }, hover: { rotate: 45 } }} transition={springSnappy}>
          <ArrowUpRight size={16} strokeWidth={1.6} />
        </motion.span>
      </motion.button>
    </Magnetic>
  );
}

function GhostButton({ children, onClick }) {
  return (
    <Magnetic strength={0.25}>
      <motion.button
        type="button"
        onClick={onClick}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileTap={{ scale: 0.96 }}
        variants={{ rest: { borderColor: "rgba(29,38,34,0.28)", color: "#1D2622" }, hover: { borderColor: "rgba(46,94,78,1)", color: "#2E5E4E" } }}
        className="f-label relative inline-flex items-center gap-3 border px-7 py-4 text-[13px] uppercase tracking-[0.2em]"
      >
        {children}
        <motion.span variants={{ rest: { y: 0 }, hover: { y: 3 } }} transition={springSnappy}>
          <ArrowDown size={15} strokeWidth={1.6} />
        </motion.span>
      </motion.button>
    </Magnetic>
  );
}

function CountUp({ to, decimals = 0, play }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!play) return undefined;
    const controls = animate(0, to, { duration: 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: setValue });
    return () => controls.stop();
  }, [play, to]);
  return value.toLocaleString("ru-RU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function Spark({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 0C12.6 7.2 16.8 11.4 24 12 16.8 12.6 12.6 16.8 12 24 11.4 16.8 7.2 12.6 0 12 7.2 11.4 11.4 7.2 12 0Z" fill="currentColor" />
    </svg>
  );
}

function Container({ children, className = "" }) {
  return <div className={`mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-12 ${className}`}>{children}</div>;
}

function SectionHead({ eyebrow, title, italic, aside }) {
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-7">
        <Reveal y={30}>
          <p className="f-label text-[12px] uppercase tracking-[0.22em] text-[#2E5E4E]">{eyebrow}</p>
        </Reveal>
        <h2 aria-label={`${title} ${italic}`} className="f-display mt-5 text-[clamp(3.6rem,12vw,9rem)] font-extrabold uppercase leading-[0.88]">
          <SplitLetters text={title} trigger="view" />{" "}
          <span className="italic text-[#2E5E4E]">
            <SplitLetters text={italic} trigger="view" delay={0.18} />
          </span>
        </h2>
      </div>
      {aside ? (
        <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.15} y={40}>
          <p className="max-w-md text-[15px] leading-relaxed text-[#1D2622]/70">{aside}</p>
        </Reveal>
      ) : null}
    </div>
  );
}

/* ───────────────────────── Гильоширное клеймо ───────────────────── */

/** Рисует гильош (как на банкнотах и циферблатах): уникальная розетка для каждого мастера. */
function drawGuilloche(ctx, w, h, seed, { background = true, cyRatio = 0.44 } = {}) {
  const rand = mulberry32(seed * 7919);
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h * cyRatio;
  const R = Math.min(w, h) * (background ? 0.44 : 0.48);

  if (background) {
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.75);
    bg.addColorStop(0, "#F8F9F5");
    bg.addColorStop(0.55, "#EEF1EC");
    bg.addColorStop(1, "#E2E7E1");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    // фон «гравюрой»: волнистая штриховка
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "rgba(46,94,78,0.08)";
    const freq = 0.02 + rand() * 0.02;
    for (let y = -10; y < h + 10; y += 5) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const yy = y + Math.sin(x * freq + y * 0.045) * 2.4;
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
  }

  const ink = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  ink.addColorStop(0, "#1D2622");
  ink.addColorStop(0.35, "#4E8A72");
  ink.addColorStop(0.6, "#2E5E4E");
  ink.addColorStop(1, "#6E9C88");
  ctx.strokeStyle = ink;

  const layers = [
    { base: 0.93, amp: 0.05, lobes: 22 + Math.floor(rand() * 10), copies: 18, k: 3, alpha: 0.4 },
    { base: 0.66, amp: 0.15, lobes: 7 + Math.floor(rand() * 6), copies: 30, k: 2 + Math.floor(rand() * 3), alpha: 0.34 },
    { base: 0.34, amp: 0.12, lobes: 5 + Math.floor(rand() * 4), copies: 22, k: 4, alpha: 0.3 },
  ];
  layers.forEach((L) => {
    ctx.lineWidth = 0.55;
    ctx.globalAlpha = L.alpha;
    for (let c = 0; c < L.copies; c += 1) {
      const rot = (c / L.copies) * ((Math.PI * 2) / L.lobes);
      ctx.beginPath();
      for (let i = 0; i <= 720; i += 1) {
        const t = (i / 720) * Math.PI * 2;
        const r = R * (L.base + L.amp * Math.sin(L.lobes * (t + rot)) * (0.72 + 0.28 * Math.cos(L.k * t)));
        const x = cx + r * Math.cos(t);
        const y = cy + r * Math.sin(t);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  });

  // солнечные лучи по внешнему кольцу
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 180; i += 1) {
    const t = (i / 180) * Math.PI * 2;
    const r1 = R * 1.0;
    const r2 = R * (i % 5 === 0 ? 1.08 : 1.04);
    ctx.beginPath();
    ctx.moveTo(cx + r1 * Math.cos(t), cy + r1 * Math.sin(t));
    ctx.lineTo(cx + r2 * Math.cos(t), cy + r2 * Math.sin(t));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // площадка под монограмму
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "#F7F7F3";
  ctx.fill();
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = "rgba(46,94,78,0.7)";
  ctx.stroke();
}

function Hallmark({ seed, background = true, cyRatio = 0.44 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return undefined;
    const draw = () => {
      const { width, height } = parent.getBoundingClientRect();
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * 1.2;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawGuilloche(ctx, width, height, seed, { background, cyRatio });
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [seed, background, cyRatio]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

/* ───────────────────────────── Лоадер ───────────────────────────── */

function LoaderFace({ count, cut }) {
  return (
    <div className="relative h-full w-full">
      <div className="f-label absolute left-4 right-4 top-6 flex justify-between text-[11px] uppercase tracking-[0.22em] text-[#1D2622]/55 sm:left-10 sm:right-10 sm:top-8">
        <span>Onix Barbershop · Гомель</span>
        <span>Est. 2014</span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="f-display flex text-[clamp(7rem,36vw,26rem)] font-extrabold leading-[0.82]" aria-hidden="true">
          {[..."ONIX"].map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.04em]">
              <motion.span
                className="accent-text inline-block"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ type: "spring", stiffness: 90, damping: 15, delay: 0.15 + i * 0.09 }}
              >
                {ch}
              </motion.span>
            </span>
          ))}
        </div>
      </div>
      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.1em" }}
        animate={{ opacity: 1, letterSpacing: "0.55em" }}
        transition={{ duration: 1.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="f-label absolute inset-x-0 top-[calc(50%+clamp(3.4rem,15vw,11rem))] text-center text-[11px] uppercase text-[#2E5E4E]"
      >
        Искусство острой линии
      </motion.p>
      <motion.span
        aria-hidden="true"
        className="absolute inset-x-0 top-1/2 h-px origin-left bg-gradient-to-r from-transparent via-[#4E8A72] to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: cut ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.83, 0, 0.17, 1] }}
      />
      <div className="absolute bottom-6 left-4 right-4 flex items-end justify-between gap-6 sm:bottom-8 sm:left-10 sm:right-10">
        <span className="f-display text-6xl font-bold leading-none tabular-nums text-[#1D2622]/90 sm:text-8xl">{String(count).padStart(3, "0")}</span>
        <div className="w-32 sm:w-52">
          <div className="f-label mb-2 text-right text-[11px] uppercase tracking-[0.25em] text-[#1D2622]/55">Правка лезвия</div>
          <div className="h-px bg-[#1D2622]/15">
            <div className="h-px bg-[#2E5E4E]" style={{ width: `${count}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Кинематографичный вход: буквы, счётчик, «разрез» бритвой — и экран расходится. */
function Loader({ onDone }) {
  const [count, setCount] = useState(0);
  const [cut, setCut] = useState(false);
  useEffect(() => {
    const controls = animate(0, 100, { duration: 2.1, ease: [0.65, 0, 0.35, 1], onUpdate: (v) => setCount(Math.round(v)) });
    const t1 = setTimeout(() => setCut(true), 2150);
    const t2 = setTimeout(onDone, 2700);
    return () => {
      controls.stop();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);
  const half = { duration: 1.15, ease: EASE_CUT };
  return (
    <div className="fixed inset-0 z-[200]" role="status" aria-label="Загрузка сайта">
      <motion.div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-[#ECEDE8]" exit={{ y: "-100%" }} transition={half}>
        <div className="absolute inset-x-0 top-0 h-[200%]">
          <LoaderFace count={count} cut={cut} />
        </div>
      </motion.div>
      <motion.div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-[#ECEDE8]" exit={{ y: "100%" }} transition={half}>
        <div className="absolute inset-x-0 bottom-0 h-[200%]">
          <LoaderFace count={count} cut={cut} />
        </div>
      </motion.div>
    </div>
  );
}

/* ───────────────────────────── Курсор ───────────────────────────── */

function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState("default");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const dotX = useSpring(x, { stiffness: 1400, damping: 70, mass: 0.2 });
  const dotY = useSpring(y, { stiffness: 1400, damping: 70, mass: 0.2 });
  const ringX = useSpring(x, { stiffness: 170, damping: 19, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 170, damping: 19, mass: 0.6 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;
    setEnabled(true);
    const root = document.documentElement;
    root.classList.add("gr-cursor");
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e) => {
      const el = e.target instanceof Element ? e.target.closest("a, button, input, textarea, [data-cursor]") : null;
      if (!el) setMode("default");
      else if (el.matches("input, textarea")) setMode("text");
      else setMode("link");
    };
    const leave = () => {
      x.set(-100);
      y.set(-100);
    };
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", over);
    root.addEventListener("pointerleave", leave);
    return () => {
      root.classList.remove("gr-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      root.removeEventListener("pointerleave", leave);
    };
  }, [x, y]);

  if (!enabled) return null;
  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[300] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-[#2E5E4E]"
        style={{ x: dotX, y: dotY }}
        animate={{ scale: mode === "link" ? 0 : 1 }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[300] -ml-5 -mt-5 h-10 w-10 rounded-full border border-[#2E5E4E]/60"
        style={{ x: ringX, y: ringY }}
        animate={{
          scale: mode === "link" ? 1.7 : mode === "text" ? 0.35 : 1,
          backgroundColor: mode === "link" ? "rgba(46,94,78,0.14)" : "rgba(46,94,78,0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      />
    </>
  );
}

/* ───────────────────────────── Навигация ─────────────────────────── */

function Nav({ ready, onNav }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(v > prev && v > 240);
    setScrolled(v > 30);
  });

  const go = (id) => {
    setOpen(false);
    onNav(id);
  };

  return (
    <>
      <motion.header
        className="fixed inset-x-0 z-50"
        style={{ top: "env(safe-area-inset-top, 0px)" }}
        initial={{ y: -120 }}
        animate={{ y: !ready || (hidden && !open) ? -120 : 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <Container className="pt-3">
          <motion.nav
            aria-label="Основная навигация"
            className="flex items-center justify-between gap-4 border px-4 py-3 sm:px-6"
            animate={{
              backgroundColor: scrolled || open ? "rgba(247,247,243,0.8)" : "rgba(247,247,243,0)",
              borderColor: scrolled || open ? "rgba(29,38,34,0.1)" : "rgba(29,38,34,0)",
            }}
            style={{
              backdropFilter: scrolled || open ? "blur(18px) saturate(140%)" : "none",
              WebkitBackdropFilter: scrolled || open ? "blur(18px) saturate(140%)" : "none",
            }}
          >
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                go("top");
              }}
              className="flex items-baseline gap-3"
              aria-label="Onix Barbershop — наверх"
            >
              <span className="f-display text-3xl font-extrabold tracking-[0.12em] text-[#1D2622]">ONIX</span>
              <span className="f-label text-[10px] uppercase tracking-[0.22em] text-[#2E5E4E]">
                Barbershop<span className="hidden sm:inline"> · Gomel</span>
              </span>
            </a>
            <ul className="hidden items-center gap-9 lg:flex">
              {NAV.map((item) => (
                <li key={item.id}>
                  <motion.a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(item.id);
                    }}
                    initial="rest"
                    animate="rest"
                    whileHover="hover"
                    className="f-label relative block py-1 text-[12px] uppercase tracking-[0.24em] text-[#1D2622]/80"
                    variants={{ rest: { color: "rgba(29,38,34,0.75)" }, hover: { color: "#1D2622" } }}
                  >
                    {item.label}
                    <motion.span
                      aria-hidden="true"
                      className="absolute -bottom-0.5 left-0 h-px w-full origin-left bg-[#2E5E4E]"
                      variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                      transition={springSnappy}
                    />
                  </motion.a>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <Magnetic strength={0.2}>
                  <motion.button
                    type="button"
                    onClick={() => go("booking")}
                    whileHover={{ backgroundColor: "#2E5E4E", color: "#F7F7F3" }}
                    whileTap={{ scale: 0.95 }}
                    className="f-label border border-[#2E5E4E] px-5 py-2.5 text-[12px] uppercase tracking-[0.22em] text-[#2E5E4E]"
                  >
                    Записаться
                  </motion.button>
                </Magnetic>
              </div>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-label={open ? "Закрыть меню" : "Открыть меню"}
                className="grid h-10 w-10 place-items-center border border-[#1D2622]/20 text-[#1D2622] lg:hidden"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={open ? "x" : "m"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={springSnappy}
                  >
                    {open ? <X size={18} /> : <Menu size={18} />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </motion.nav>
        </Container>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="menu"
            className="fixed inset-0 z-40 flex flex-col justify-end bg-[#ECEDE8] px-4 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] pt-28 sm:px-8 lg:hidden"
            initial={{ clipPath: "circle(0% at 92% 6%)" }}
            animate={{ clipPath: "circle(150% at 92% 6%)" }}
            exit={{ clipPath: "circle(0% at 92% 6%)" }}
            transition={{ duration: 0.8, ease: EASE_CUT }}
          >
            <ul className="flex flex-col gap-2">
              {NAV.map((item, i) => (
                <li key={item.id} className="overflow-hidden">
                  <motion.button
                    type="button"
                    onClick={() => go(item.id)}
                    className="f-display flex w-full items-baseline justify-between border-b border-[#1D2622]/15 py-3 text-left text-[clamp(3rem,14vw,5rem)] font-extrabold uppercase leading-none"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ type: "spring", stiffness: 110, damping: 16, delay: 0.25 + i * 0.07 }}
                  >
                    {item.label}
                    <ArrowUpRight className="text-[#2E5E4E]" size={28} strokeWidth={1.2} />
                  </motion.button>
                </li>
              ))}
            </ul>
            <motion.div
              className="f-label mt-10 flex flex-wrap justify-between gap-3 text-[12px] uppercase tracking-[0.2em] text-[#1D2622]/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span>{ADDRESS}</span>
              <span className="text-[#2E5E4E]">{PHONE}</span>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────── Чертёж опасной бритвы ─────────────────── */

const RZ = { cx: 196, cy: 240, a: -40, s: 0.6 };
const RZ_RAD = (RZ.a * Math.PI) / 180;
const rzPoint = (x, y) => [RZ.cx + RZ.s * (x * Math.cos(RZ_RAD) - y * Math.sin(RZ_RAD)), RZ.cy + RZ.s * (x * Math.sin(RZ_RAD) + y * Math.cos(RZ_RAD))];
const DIAL_TICKS = Array.from({ length: 120 }, (_, i) => {
  const t = (i * 3 * Math.PI) / 180;
  const long = i % 5 === 0;
  const r1 = 172;
  const r2 = long ? 158 : 165;
  return { x1: RZ.cx + r1 * Math.cos(t), y1: RZ.cy + r1 * Math.sin(t), x2: RZ.cx + r2 * Math.cos(t), y2: RZ.cy + r2 * Math.sin(t), long };
});
const BLADE = "M -4 -9 L 46 -11 L 290 -13 Q 302 -13 302 -1 L 302 30 Q 302 41 290 41 L 82 40 C 66 40 58 32 54 22 C 51 14 48 10 40 9 L -4 9 Z";
const HANDLE = "M 8 -15 C -60 -20 -200 -20 -272 -12 C -294 -10 -294 10 -272 12 C -200 20 -60 20 8 15 C 18 12 18 -12 8 -15 Z";
const [BLADE_AX, BLADE_AY] = rzPoint(230, 38);
const [HANDLE_AX, HANDLE_AY] = rzPoint(-150, 10);

function RazorArt({ ready }) {
  const draw = (d) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: ready ? { pathLength: 1, opacity: 1 } : undefined,
    transition: { pathLength: { duration: 1.9, ease: [0.65, 0, 0.35, 1], delay: d }, opacity: { duration: 0.01, delay: d } },
  });
  const fade = (d) => ({ initial: { opacity: 0 }, animate: ready ? { opacity: 1 } : undefined, transition: { duration: 1.1, delay: d } });

  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <rect width="400" height="500" fill="#F4F5F1" />
      <rect width="400" height="500" fill="url(#gr-grid)" />
      <circle cx={RZ.cx} cy={RZ.cy} r="230" fill="url(#gr-glow)" />

      <motion.g {...fade(0.5)}>
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 140, repeat: Infinity, ease: "linear" }}>
          {DIAL_TICKS.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#1D2622" strokeOpacity={t.long ? 0.28 : 0.12} strokeWidth={t.long ? 0.9 : 0.6} />
          ))}
        </motion.g>
        <circle cx={RZ.cx} cy={RZ.cy} r="148" fill="none" stroke="#2E5E4E" strokeOpacity="0.16" strokeDasharray="1 5" />
        <circle cx={RZ.cx} cy={RZ.cy} r="188" fill="none" stroke="#1D2622" strokeOpacity="0.07" />
        <line x1="16" y1={RZ.cy} x2="384" y2={RZ.cy} stroke="#1D2622" strokeOpacity="0.07" strokeDasharray="6 4" />
        <line x1={RZ.cx} y1="36" x2={RZ.cx} y2="440" stroke="#1D2622" strokeOpacity="0.07" strokeDasharray="6 4" />
      </motion.g>

      <g transform={`translate(${RZ.cx} ${RZ.cy}) rotate(${RZ.a}) scale(${RZ.s})`}>
        {/* полотно */}
        <motion.path d={BLADE} fill="url(#gr-steel)" {...fade(1.6)} />
        <motion.path d={BLADE} fill="none" stroke="#1D2622" strokeWidth="1.1" {...draw(0.8)} />
        <motion.path d="M 84 36.5 L 290 37 Q 298 37 298.5 31" fill="none" stroke="#FFFFFF" strokeWidth="1.8" {...draw(1.4)} />
        <motion.path d="M 64 5 Q 180 2 298 3" fill="none" stroke="#1D2622" strokeOpacity="0.35" strokeWidth="1" {...fade(1.8)} />
        {[24, 28, 32, 36, 40].map((x) => (
          <motion.line key={x} x1={x} y1="4" x2={x} y2="9" stroke="#1D2622" strokeOpacity="0.55" strokeWidth="1" {...fade(1.8)} />
        ))}
        <motion.text x="118" y="27" className="f-label" fontSize="11" letterSpacing="3" fill="#1D2622" fillOpacity="0.45" {...fade(2)}>
          ONIX · 5/8
        </motion.text>
        {/* рукоять */}
        <motion.path d={HANDLE} fill="url(#gr-horn)" {...fade(1.6)} />
        <motion.path d={HANDLE} fill="none" stroke="#1D2622" strokeWidth="1.1" {...draw(0.9)} />
        <motion.path d="M -250 0 L -26 0" fill="none" stroke="#D9DEDB" strokeOpacity="0.7" strokeWidth="0.8" strokeDasharray="2 4" {...draw(1.2)} />
        <motion.path d="M -150 -5 L -144 0 L -150 5 L -156 0 Z" fill="#D9DEDB" {...fade(2)} />
        <motion.circle cx="-262" cy="0" r="4" fill="url(#gr-nickel)" {...fade(1.9)} />
        <motion.circle cx="0" cy="0" r="6.5" fill="url(#gr-nickel)" stroke="#1D2622" strokeWidth="1" {...fade(1.9)} />
        <motion.circle cx="0" cy="0" r="2" fill="#1D2622" {...fade(1.9)} />
        {/* размеры */}
        <motion.g {...fade(2.2)} stroke="#1D2622" strokeOpacity="0.5" strokeWidth="0.9" fill="none">
          <line x1="46" y1="-34" x2="302" y2="-34" />
          <line x1="46" y1="-42" x2="46" y2="-18" />
          <line x1="302" y1="-42" x2="302" y2="-20" />
          <line x1="324" y1="-13" x2="324" y2="41" />
          <line x1="308" y1="-13" x2="332" y2="-13" />
          <line x1="308" y1="41" x2="332" y2="41" />
          <path d="M 46 -34 l 9 -3 v 6 z M 302 -34 l -9 -3 v 6 z" fill="#1D2622" fillOpacity="0.5" stroke="none" />
        </motion.g>
        <motion.text {...fade(2.3)} x="174" y="-42" textAnchor="middle" className="f-label" fontSize="13" letterSpacing="2" fill="#1D2622" fillOpacity="0.75">
          76 мм
        </motion.text>
        <g transform="rotate(90 342 14)">
          <motion.text {...fade(2.3)} x="342" y="14" textAnchor="middle" className="f-label" fontSize="13" letterSpacing="1" fill="#2E5E4E">
            5/8″
          </motion.text>
        </g>
      </g>

      {/* выноски */}
      <motion.g {...fade(2.4)} fill="none" stroke="#2E5E4E" strokeOpacity="0.7" strokeWidth="0.8">
        <polyline points={`${BLADE_AX},${BLADE_AY} ${BLADE_AX + 22},${BLADE_AY + 44} 388,${BLADE_AY + 44}`} />
        <polyline points={`${HANDLE_AX},${HANDLE_AY} ${HANDLE_AX + 28},${HANDLE_AY + 78} 12,${HANDLE_AY + 78}`} />
        <circle cx={BLADE_AX} cy={BLADE_AY} r="2.4" fill="#2E5E4E" stroke="none" />
        <circle cx={HANDLE_AX} cy={HANDLE_AY} r="2.4" fill="#2E5E4E" stroke="none" />
      </motion.g>
      <motion.g {...fade(2.5)} className="f-label" fontSize="8.5" letterSpacing="1.2">
        <text x="388" y={BLADE_AY + 57} textAnchor="end" fill="#1D2622" fillOpacity="0.8">
          ПОЛОТНО
        </text>
        <text x="388" y={BLADE_AY + 69} textAnchor="end" fill="#2E5E4E">
          СТАЛЬ · 60 HRC
        </text>
        <text x="12" y={HANDLE_AY + 91} fill="#1D2622" fillOpacity="0.8">
          РУКОЯТЬ
        </text>
        <text x="12" y={HANDLE_AY + 103} fill="#2E5E4E">
          РОГ БУЙВОЛА
        </text>
      </motion.g>

      {/* сечение лезвия */}
      <g transform="translate(290 290)">
        <motion.g {...fade(2.6)}>
          <rect width="96" height="94" fill="#F7F7F3" fillOpacity="0.92" stroke="#1D2622" strokeOpacity="0.18" />
          <text x="8" y="14" className="f-label" fontSize="7.5" letterSpacing="1" fill="#1D2622" fillOpacity="0.6">
            СЕЧЕНИЕ А–А
          </text>
          <path d="M 40 22 L 56 22 L 56 30 Q 49.5 52 48.6 82 L 47.4 82 Q 46.5 52 40 30 Z" fill="url(#gr-steel)" stroke="#1D2622" strokeWidth="0.6" />
          <line x1="48" y1="82" x2="44.4" y2="58" stroke="#2E5E4E" strokeWidth="0.6" />
          <line x1="48" y1="82" x2="51.6" y2="58" stroke="#2E5E4E" strokeWidth="0.6" />
          <path d="M 45.63 66.18 A 16 16 0 0 1 50.37 66.18" fill="none" stroke="#2E5E4E" strokeWidth="0.8" />
          <text x="60" y="70" className="f-label" fontSize="9" fill="#2E5E4E">
            17°
          </text>
        </motion.g>
      </g>
    </svg>
  );
}

const STRIP_DRIFT = [0, -90, 50, -140];

function RazorStrip({ i, n, ready, progress }) {
  const y = useTransform(progress, [0, 1], [0, STRIP_DRIFT[i]]);
  const l = (i / n) * 100;
  const r = ((i + 1) / n) * 100;
  return (
    <motion.div
      className="absolute inset-0"
      style={{ y, clipPath: `polygon(calc(${l}% - 1px) 0, calc(${r}% + 1px) 0, calc(${r}% + 1px) 100%, calc(${l}% - 1px) 100%)` }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ y: i % 2 ? "-102%" : "102%" }}
        animate={ready ? { y: "0%" } : undefined}
        transition={{ type: "spring", stiffness: 48, damping: 15, mass: 1.1, delay: 0.15 + i * 0.1 }}
      >
        <RazorArt ready={ready} />
      </motion.div>
    </motion.div>
  );
}

/** Правая половина героя: «разрезанное» изображение, которое расходится полосами при скролле. */
function RazorPanel({ ready, progress }) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 100, damping: 15 });
  const sry = useSpring(ry, { stiffness: 100, damping: 15 });
  const lateIn = (d) => ({
    initial: { opacity: 0, y: 16 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { type: "spring", stiffness: 80, damping: 16, delay: d },
  });

  return (
    <motion.div
      ref={ref}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = ref.current.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 8);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1400 }}
      className="relative mx-auto aspect-[4/5] w-full max-w-[540px] lg:ml-auto lg:mr-0"
    >
      <div className="absolute inset-0 overflow-hidden border border-[#1D2622]/15 bg-[#F4F5F1]">
        {[0, 1, 2, 3].map((i) => (
          <RazorStrip key={i} i={i} n={4} ready={ready} progress={progress} />
        ))}
      </div>

      {[
        "-left-2 -top-2 border-l border-t",
        "-right-2 -top-2 border-r border-t",
        "-bottom-2 -left-2 border-b border-l",
        "-bottom-2 -right-2 border-b border-r",
      ].map((c) => (
        <motion.span key={c} aria-hidden="true" className={`absolute h-5 w-5 border-[#2E5E4E] ${c}`} {...lateIn(0.9)} />
      ))}

      <motion.div
        {...lateIn(1.1)}
        className="f-label pointer-events-none absolute inset-x-0 top-0 flex justify-between p-4 text-[11px] uppercase tracking-[0.22em] text-[#1D2622]/65"
      >
        <span>Чертёж № 01</span>
        <span className="text-[#2E5E4E]">М 1:2</span>
      </motion.div>

      <motion.div
        {...lateIn(1.3)}
        className="f-label absolute inset-x-0 bottom-0 grid grid-cols-[1fr_auto_auto] border-t border-[#2E5E4E]/30 bg-[#F7F7F3]/80 text-[10px] uppercase tracking-[0.16em] text-[#1D2622]/55 backdrop-blur-md"
      >
        <div className="min-w-0 border-r border-[#2E5E4E]/20 px-4 py-2.5">
          <span className="block">Изделие</span>
          <span className="f-display block truncate text-xl normal-case italic tracking-normal text-[#1D2622]">Опасная бритва</span>
        </div>
        <div className="border-r border-[#2E5E4E]/20 px-4 py-2.5">
          <span className="block">Сталь</span>
          <span className="mt-1 block text-[11px] text-[#1D2622]">60 HRC</span>
        </div>
        <div className="px-4 py-2.5">
          <span className="block">Лист</span>
          <span className="mt-1 block text-[11px] text-[#2E5E4E]">01</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -40, rotate: -8 }}
        animate={ready ? { opacity: 1, x: 0, rotate: -3 } : undefined}
        transition={{ type: "spring", stiffness: 60, damping: 12, delay: 1.5 }}
        className="absolute -left-3 top-[14%] sm:-left-12"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="border border-[#1D2622]/15 bg-[#F7F7F3]/75 px-5 py-4 shadow-[0_30px_60px_-20px_rgba(29,38,34,0.2)] backdrop-blur-xl"
        >
          <div className="flex gap-0.5 text-[#9A6440]">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <div className="f-display mt-2 text-5xl font-bold leading-none">4,98</div>
          <div className="f-label mt-1 text-[11px] uppercase tracking-[0.18em] text-[#1D2622]/60">1 240 отзывов</div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────────────── Герой ───────────────────────────── */

function Hero({ ready, onNav }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 40, damping: 18 });
  const smy = useSpring(my, { stiffness: 40, damping: 18 });
  const wordX = useTransform(smx, [-0.5, 0.5], [60, -60]);
  const glowX = useTransform(smx, [-0.5, 0.5], [-120, 120]);
  const glowY = useTransform(smy, [-0.5, 0.5], [-80, 80]);
  const show = (d) => ({
    initial: { opacity: 0, y: 40 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { type: "spring", stiffness: 70, damping: 16, delay: d },
  });

  return (
    <section
      id="top"
      ref={ref}
      onMouseMove={(e) => {
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
      className="relative isolate overflow-hidden pb-24 pt-28 sm:pt-36 lg:flex lg:min-h-[100svh] lg:items-center lg:pt-32"
    >
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ y: bgY }}>
        <motion.div
          className="absolute left-[30%] top-[-20%] h-[80vmax] w-[80vmax] rounded-full bg-[radial-gradient(circle,rgba(46,94,78,0.14),transparent_60%)]"
          style={{ x: glowX, y: glowY }}
        />
        <Container className="absolute inset-0 grid grid-cols-4 lg:grid-cols-12">
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className={`border-l border-[#1D2622]/[0.07] ${i >= 4 ? "hidden lg:block" : ""} ${i === 11 || i === 3 ? "border-r" : ""} ${i === 3 ? "lg:border-r-0" : ""}`}
            />
          ))}
        </Container>
        <motion.div
          className="f-display stroke-text absolute bottom-[-7vw] left-[-2vw] whitespace-nowrap text-[44vw] font-extrabold leading-none"
          style={{ x: wordX }}
        >
          ONIX
        </motion.div>
      </motion.div>

      <Container className="grid items-center gap-16 lg:grid-cols-12 lg:gap-8">
        <motion.div className="lg:col-span-7" style={{ y: copyY }}>
          <motion.div {...show(0.1)} className="f-label flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] uppercase tracking-[0.2em] text-[#1D2622]/65">
            <span className="text-[#2E5E4E]">[ Гомель · Румянцевская, 21 ]</span>
            <span className="h-px w-10 bg-[#1D2622]/25" />
            <span>с 2014 года</span>
          </motion.div>

          <h1
            aria-label="Искусство острой линии"
            className="f-display mt-7 text-[clamp(4rem,21vw,8rem)] font-extrabold uppercase leading-[0.86] lg:text-[clamp(5rem,11vw,11rem)]"
          >
            <span className="block">
              <SplitLetters text="Искусство" play={ready} delay={0.25} />
            </span>
            <span className="block italic text-[#2E5E4E]">
              <SplitLetters text="острой" play={ready} delay={0.5} />
            </span>
            <span className="flex items-start gap-4 pl-[0.9em]">
              <SplitLetters text="линии" play={ready} delay={0.7} />
              <motion.span {...show(1.4)} className="f-label mt-4 whitespace-nowrap text-[12px] font-normal tracking-[0.2em] text-[#1D2622]/55">
                ± 0,5 мм
              </motion.span>
            </span>
          </h1>

          <motion.p {...show(0.95)} className="mt-9 max-w-[34rem] text-[16px] leading-relaxed text-[#1D2622]/75 sm:text-[17px]">
            Барбершоп закрытого формата на шесть кресел. Каждый визит начинается с консультации и заканчивается горячим полотенцем. Работаем только по записи,
            поэтому мастер не торопится.
          </motion.p>

          <motion.div {...show(1.1)} className="mt-10 flex flex-wrap items-center gap-4">
            <PrimaryButton onClick={() => onNav("booking")}>Записаться</PrimaryButton>
            <GhostButton onClick={() => onNav("craft")}>Услуги и цены</GhostButton>
          </motion.div>

          <motion.dl {...show(1.25)} className="mt-14 grid max-w-xl grid-cols-3 gap-4 border-t border-[#1D2622]/15 pt-6 sm:gap-6">
            {[
              ["Лет ремесла", 12, 0],
              ["Кресел", 6, 0],
              ["Оценка гостей", 4.98, 2],
            ].map(([label, value, dec]) => (
              <div key={label} className="min-w-0">
                <dt className="f-label text-[11px] uppercase tracking-[0.2em] text-[#1D2622]/55">{label}</dt>
                <dd className="f-display mt-1 text-5xl font-bold tabular-nums text-[#1D2622] sm:text-6xl">
                  <CountUp to={value} decimals={dec} play={ready} />
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <div className="lg:col-span-5">
          <RazorPanel ready={ready} progress={scrollYProgress} />
        </div>
      </Container>

      <motion.button
        type="button"
        {...show(1.6)}
        onClick={() => onNav("craft")}
        className="f-label absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#1D2622]/55 lg:flex"
      >
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <ArrowDown size={14} />
        </motion.span>
        Листайте
      </motion.button>
      <div className="f-label pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 text-[11px] uppercase tracking-[0.22em] text-[#1D2622]/40 [writing-mode:vertical-rl] xl:block">
        52°25′ N · 31°00′ E
      </div>
    </section>
  );
}

/* ───────────────────────────── Бегущая строка ───────────────────── */

function VelocityMarquee({ children, baseVelocity = -3 }) {
  const reduced = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const skew = useTransform(smooth, [-2500, 2500], [10, -10]);
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    let moveBy = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    moveBy += dir.current * moveBy * f;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div className="flex w-max flex-nowrap" style={{ x, skewX: skew }}>
        {[0, 1, 2, 3].map((k) => (
          <div key={k} className="flex shrink-0 items-center" aria-hidden={k > 0 ? "true" : undefined}>
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function MarqueeBand() {
  const words = ["Стрижка", "Королевское бритьё", "Скин-фейд", "Борода", "Горячее полотенце", "Камуфляж седины", "Укладка"];
  return (
    <section aria-label="Направления барбершопа" className="relative py-14 sm:py-20">
      <div className="relative -ml-[5%] w-[110%] -rotate-2 bg-[#2E5E4E] py-3 text-[#F7F7F3] sm:py-4">
        <VelocityMarquee baseVelocity={-3}>
          {words.map((w) => (
            <span key={w} className="flex items-center">
              <span className="f-display px-6 text-[clamp(2.4rem,6vw,5rem)] font-extrabold uppercase italic leading-[1.05] sm:px-10">{w}</span>
              <Spark className="h-5 w-5 sm:h-7 sm:w-7" />
            </span>
          ))}
        </VelocityMarquee>
      </div>
      <div className="relative -ml-[5%] -mt-2 w-[110%] rotate-[1.5deg] border-y border-[#1D2622]/15 bg-[#ECEDE8] py-3">
        <VelocityMarquee baseVelocity={2}>
          {words.map((w) => (
            <span key={w} className="f-label flex items-center gap-6 px-6 text-[13px] uppercase tracking-[0.22em] text-[#1D2622]/70">
              {w}
              <span className="h-1 w-1 rotate-45 bg-[#2E5E4E]" />
            </span>
          ))}
        </VelocityMarquee>
      </div>
    </section>
  );
}

/* ───────────────────────────── Манифест (GSAP) ──────────────────── */

const MANIFESTO = [
  { t: "Шесть кресел.", em: true },
  { t: "Час на каждого гостя. Мастер изучает форму головы, рост волос и линию бороды до того, как возьмёт ножницы. Хорошая стрижка держит форму" },
  { t: "три недели.", em: true },
];

function Manifesto() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useIsoLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".mf-w",
        { opacity: 0.14, yPercent: 35, rotateX: -70, transformPerspective: 600, transformOrigin: "50% 100%" },
        {
          opacity: 1,
          yPercent: 0,
          rotateX: 0,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".mf-text", start: "top 80%", end: "bottom 55%", scrub: 1 },
        },
      );
      gsap.fromTo(
        ".mf-rule",
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { trigger: ref.current, start: "top 85%", end: "bottom 45%", scrub: true } },
      );
      gsap.fromTo(
        ".mf-seal",
        { rotate: -60, scale: 0.8 },
        { rotate: 200, scale: 1, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.6 } },
      );
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={ref} aria-label="Манифест" className="relative py-24 sm:py-36">
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="flex items-center gap-8 lg:col-span-3 lg:flex-col lg:items-start">
          <p className="f-label text-[12px] uppercase tracking-[0.22em] text-[#2E5E4E]">[ Манифест ]</p>
          <div className="mf-seal relative aspect-square w-28 overflow-hidden rounded-full sm:w-40 lg:w-48">
            <Hallmark seed={5} background={false} cyRatio={0.5} />
            <span className="f-display absolute inset-0 grid place-items-center text-2xl font-bold italic text-[#4E8A72] sm:text-3xl">O</span>
          </div>
        </div>
        <p className="mf-text f-display text-[clamp(2.4rem,5.6vw,5.4rem)] font-semibold leading-[1.04] text-[#1D2622] lg:col-span-9">
          {MANIFESTO.map((seg, si) =>
            seg.t.split(" ").map((w, wi) => (
              <React.Fragment key={`${si}-${wi}`}>
                <span className={`mf-w inline-block ${seg.em ? "italic text-[#2E5E4E]" : ""}`}>{w}</span>{" "}
              </React.Fragment>
            )),
          )}
        </p>
      </Container>
      <Container className="mt-16">
        <div className="mf-rule h-px origin-left bg-gradient-to-r from-[#2E5E4E] via-[#2E5E4E]/40 to-transparent" />
      </Container>
    </section>
  );
}

/* ───────────────────────────── Услуги ───────────────────────────── */

function PriceTag({ price, rot, hover }) {
  const chars = [...fmtPrice(price)];
  return (
    <div className="relative -mt-1 flex shrink-0 flex-col items-center" aria-label={`Цена: ${fmtPrice(price)}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-[#2E5E4E]" aria-hidden="true" />
      <motion.div style={{ rotate: rot, transformOrigin: "50% 0%" }} className="flex flex-col items-center">
        <span className="h-4 w-px bg-[#2E5E4E]/60" aria-hidden="true" />
        <motion.div className="relative px-3.5 pb-2 pt-4 text-center" animate={{ color: hover ? "#F7F7F3" : "#1D2622" }} transition={{ duration: 0.3 }}>
          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <motion.polygon
              points="18,0 82,0 100,18 100,100 0,100 0,18"
              stroke="#2E5E4E"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              animate={{ fill: hover ? "#2E5E4E" : "rgba(247,247,243,0.8)" }}
              transition={{ duration: 0.3 }}
            />
          </svg>
          <span className="absolute left-1/2 top-[5px] -ml-[3px] h-1.5 w-1.5 rounded-full border border-current opacity-70" aria-hidden="true" />
          <span className="f-label relative block text-[9.5px] uppercase tracking-[0.24em] opacity-70">Цена</span>
          <span className="f-display relative block whitespace-nowrap text-[1.9rem] font-bold leading-none" aria-hidden="true">
            {chars.map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block"
                animate={hover ? { y: [0, -5, 0] } : { y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.035, ease: "easeOut" }}
              >
                {ch === " " ? " " : ch}
              </motion.span>
            ))}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

function ServiceCard({ s, index, onSelect }) {
  const ref = useRef(null);
  const fine = useFinePointer();
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 160, damping: 16 });
  const sry = useSpring(ry, { stiffness: 160, damping: 16 });
  const gx = useMotionValue(-500);
  const gy = useMotionValue(-500);
  const tag = useMotionValue(0);
  const tagRot = useSpring(tag, { stiffness: 150, damping: 5, mass: 0.6 });
  const lastX = useRef(null);
  const settle = useRef(null);
  const border = useMotionTemplate`radial-gradient(380px circle at ${gx}px ${gy}px, rgba(46,94,78,0.95), rgba(46,94,78,0.35) 30%, rgba(29,38,34,0.12) 62%)`;
  const sheen = useMotionTemplate`radial-gradient(520px circle at ${gx}px ${gy}px, rgba(46,94,78,0.10), transparent 42%)`;
  const Icon = s.icon;

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    gx.set(e.clientX - r.left);
    gy.set(e.clientY - r.top);
    if (fine) {
      rx.set(-((e.clientY - r.top) / r.height - 0.5) * 9);
      ry.set(((e.clientX - r.left) / r.width - 0.5) * 11);
    }
    if (lastX.current != null) tag.set(clamp((e.clientX - lastX.current) * 1.4, -20, 20));
    lastX.current = e.clientX;
    clearTimeout(settle.current);
    settle.current = setTimeout(() => tag.set(0), 70);
  };
  const onEnter = () => {
    setHover(true);
    tag.set(16);
    clearTimeout(settle.current);
    settle.current = setTimeout(() => tag.set(0), 90);
  };
  const onLeave = () => {
    setHover(false);
    rx.set(0);
    ry.set(0);
    gx.set(-500);
    gy.set(-500);
    tag.set(-10);
    lastX.current = null;
    clearTimeout(settle.current);
    settle.current = setTimeout(() => tag.set(0), 90);
  };
  useEffect(() => () => clearTimeout(settle.current), []);

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 90, rotateX: -18 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...springSoft, delay: (index % 3) * 0.09 }}
      style={{ transformPerspective: 1200 }}
    >
      <motion.article
        ref={ref}
        onPointerMove={onMove}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        style={{ rotateX: srx, rotateY: sry, transformPerspective: 1100 }}
        whileHover={{ y: -8, scale: 1.015 }}
        transition={springSnappy}
        className="relative"
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-6 blur-2xl"
          style={{ background: "radial-gradient(closest-side, rgba(46,94,78,0.32), transparent)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: hover ? 0.7 : 0 }}
          transition={{ duration: 0.4 }}
        />
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: border }} />
        <div className="relative m-px flex flex-col gap-6 bg-[#F7F7F3]/85 p-6 backdrop-blur-xl sm:p-7">
          <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: sheen }} />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 pt-2">
              <motion.span
                className="grid h-11 w-11 place-items-center border border-[#2E5E4E]/40 text-[#2E5E4E]"
                animate={{ rotate: hover ? 90 : 0, borderColor: hover ? "rgba(46,94,78,1)" : "rgba(46,94,78,0.4)" }}
                transition={springSnappy}
              >
                <motion.span animate={{ rotate: hover ? -90 : 0 }} transition={springSnappy} className="grid place-items-center">
                  <Icon size={18} strokeWidth={1.4} />
                </motion.span>
              </motion.span>
              <div className="f-label flex flex-col text-[11px] uppercase tracking-[0.22em]">
                <span className="text-[#1D2622]/60">{s.cat}</span>
                {s.badge ? <span className="text-[#2E5E4E]">{s.badge}</span> : null}
              </div>
            </div>
            <PriceTag price={s.price} rot={tagRot} hover={hover} />
          </div>

          <div className="relative">
            <h3 className="f-display text-[2.5rem] font-bold leading-[0.95] sm:text-[2.8rem]">{s.title}</h3>
            <p className="mt-3 min-h-[4.9em] text-[15px] leading-relaxed text-[#1D2622]/70">{s.desc}</p>
          </div>

          <div className="f-label relative flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#1D2622]/15 pt-4 text-[12px] uppercase tracking-[0.16em] text-[#1D2622]/65">
            <span className="inline-flex items-center gap-2">
              <Clock size={13} strokeWidth={1.5} className="text-[#2E5E4E]" />
              {s.time} мин
            </span>
            <span>{s.tool}</span>
          </div>

          <AnimatePresence initial={false} onExitComplete={() => ScrollTrigger.refresh()}>
            {open ? (
              <motion.div
                key="details"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 140, damping: 22 }}
                onAnimationComplete={() => ScrollTrigger.refresh()}
                className="relative -mt-2 overflow-hidden"
              >
                <ul className="grid gap-2.5 pt-2">
                  {s.includes.map((item, i) => (
                    <motion.li
                      key={item}
                      className="flex items-center gap-3 text-[14px] text-[#1D2622]/80"
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...springSnappy, delay: 0.05 + i * 0.05 }}
                    >
                      <Check size={14} className="shrink-0 text-[#2E5E4E]" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="relative flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="f-label inline-flex items-center gap-2 py-1 text-[12px] uppercase tracking-[0.2em] text-[#1D2622]/80"
            >
              <motion.span animate={{ rotate: open ? 45 : 0 }} transition={springSnappy} className="grid place-items-center">
                <Plus size={14} />
              </motion.span>
              {open ? "Свернуть" : "Что входит"}
            </button>
            <motion.button
              type="button"
              onClick={() => onSelect(s.id)}
              whileHover={{ x: 4, color: "#4E8A72" }}
              transition={springSnappy}
              className="f-label inline-flex items-center gap-2 py-1 text-[12px] uppercase tracking-[0.2em] text-[#2E5E4E]"
            >
              Записаться
              <ArrowUpRight size={14} />
            </motion.button>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

function Services({ onSelect }) {
  return (
    <section id="craft" className="relative scroll-mt-20 py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute left-[-10%] top-[30%] h-[40vmax] w-[40vmax] rounded-full bg-[#2E5E4E]/10 blur-[120px]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[5%] right-[-8%] h-[32vmax] w-[32vmax] rounded-full bg-[#2E5E4E]/[0.07] blur-[110px]"
      />
      <Container>
        <SectionHead
          eyebrow="[ Услуги и цены ]"
          title="Наше"
          italic="ремесло"
          aside="Цена одинакова у всех мастеров. Время указано за весь визит, включая консультацию и укладку."
        />
        <div className="mt-14 grid items-start gap-5 sm:mt-20 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.id} s={s} index={i} onSelect={onSelect} />
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ───────────────────────────── Ритуал (GSAP pin) ────────────────── */

function Ritual() {
  const section = useRef(null);
  const track = useRef(null);
  const reduced = useReducedMotion();

  useIsoLayoutEffect(() => {
    if (reduced) return undefined;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const distance = () => Math.max(0, track.current.scrollWidth - window.innerWidth);
      const tween = gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      gsap.utils.toArray(".rt-card", track.current).forEach((card) => {
        gsap.fromTo(
          card,
          { rotateY: -38, z: -160, opacity: 0.35, transformPerspective: 1200, transformOrigin: "0% 50%" },
          {
            rotateY: 0,
            z: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "center 60%", scrub: true },
          },
        );
        gsap.fromTo(
          card.querySelector(".rt-num"),
          { xPercent: 30 },
          { xPercent: -25, ease: "none", scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true } },
        );
      });
      gsap.fromTo(
        ".rt-progress",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: section.current, start: "top top", end: () => `+=${distance()}`, scrub: true, invalidateOnRefresh: true },
        },
      );
    });
    mm.add("(max-width: 1023px)", () => {
      gsap.utils.toArray(".rt-card", track.current).forEach((card) => {
        gsap.fromTo(
          card,
          { rotateX: 32, y: 60, opacity: 0.3, transformPerspective: 900, transformOrigin: "50% 0%" },
          { rotateX: 0, y: 0, opacity: 1, ease: "power2.out", scrollTrigger: { trigger: card, start: "top 95%", end: "top 60%", scrub: 0.6 } },
        );
      });
    });
    return () => mm.revert();
  }, [reduced]);

  const total = RITUAL.reduce((sum, r) => sum + r.min, 0);

  return (
    <div>
      <section id="ritual" ref={section} className="relative scroll-mt-20 overflow-hidden py-24 lg:flex lg:h-screen lg:items-center lg:py-0">
        <div className="absolute inset-x-0 top-0 hidden h-px bg-[#1D2622]/10 lg:block">
          <div className="rt-progress h-px origin-left bg-[#2E5E4E]" />
        </div>
        <div ref={track} className="flex flex-col gap-5 px-4 sm:px-8 lg:w-max lg:flex-row lg:items-stretch lg:gap-6 lg:px-12">
          <div className="flex flex-col justify-center pb-8 lg:w-[36vw] lg:max-w-[560px] lg:pb-0 lg:pr-10">
            <p className="f-label text-[12px] uppercase tracking-[0.22em] text-[#2E5E4E]">[ Стрижка «Onix» · {total} минут ]</p>
            <h2 aria-label="Ритуал визита" className="f-display mt-5 text-[clamp(3.6rem,12vw,9rem)] font-extrabold uppercase leading-[0.88]">
              <SplitLetters text="Ритуал" trigger="view" />{" "}
              <span className="italic text-[#2E5E4E]">
                <SplitLetters text="визита" trigger="view" delay={0.18} />
              </span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[#1D2622]/70">
              Пять этапов, которые проходит каждый гость. Порядок не меняется, меняется только то, что мастер делает с вашими волосами.
            </p>
            <p className="f-label mt-8 hidden items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#1D2622]/55 lg:flex">
              Листайте вниз
              <ArrowDown size={12} className="-rotate-90" />
            </p>
          </div>
          {RITUAL.map((step) => {
            const Icon = step.icon;
            return (
              <article
                key={step.n}
                className="rt-card relative flex min-h-[300px] flex-col justify-between overflow-hidden border border-[#1D2622]/15 bg-[#F7F7F3]/80 p-7 backdrop-blur-xl sm:p-9 lg:h-[64vh] lg:max-h-[600px] lg:w-[min(30vw,460px)]"
              >
                <span
                  className="rt-num f-display stroke-text pointer-events-none absolute -right-4 -top-10 text-[14rem] font-extrabold leading-none sm:text-[18rem]"
                  aria-hidden="true"
                >
                  {step.n}
                </span>
                <div className="relative flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center border border-[#2E5E4E]/50 text-[#2E5E4E]">
                    <Icon size={20} strokeWidth={1.3} />
                  </span>
                  <span className="f-label text-[11px] uppercase tracking-[0.25em] text-[#1D2622]/55">Этап {step.n}</span>
                </div>
                <div className="relative mt-16">
                  <span className="f-label text-[12px] uppercase tracking-[0.2em] text-[#2E5E4E]">{step.min} мин</span>
                  <h3 className="f-display mt-2 text-[2.8rem] font-bold leading-none sm:text-[3.3rem]">{step.title}</h3>
                  <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[#1D2622]/70">{step.text}</p>
                </div>
              </article>
            );
          })}
          <div aria-hidden="true" className="hidden w-[6vw] shrink-0 lg:block" />
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────────── Мастера ──────────────────────────── */

function MasterCard({ m, index, onBook }) {
  const [hovered, setHovered] = useState(false);
  const fine = useFinePointer();
  const imageRef = useRef(null);
  // на тач-экранах карточка «оживает», когда доезжает до центра экрана
  const centred = useInView(imageRef, { amount: 0.7 });
  const hover = fine ? hovered : centred;
  return (
    <motion.article
      initial={{ opacity: 0, y: 100, rotateX: -16 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...springSoft, delay: index * 0.1 }}
      style={{ transformPerspective: 1100 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={index % 2 ? "lg:mt-16" : ""}
    >
      <div ref={imageRef} className="relative aspect-[3/4] overflow-hidden border border-[#1D2622]/15 bg-[#E3E7E1]" data-cursor="view">
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{
            scale: hover ? 1.16 : 1.02,
            rotate: hover ? 4 : 0,
            filter: hover ? "grayscale(0) brightness(1)" : "grayscale(1) brightness(1.03)",
          }}
          transition={{ type: "spring", stiffness: 55, damping: 18 }}
        >
          {m.photo ? <img src={m.photo} alt={m.name} className="h-full w-full object-cover" /> : <Hallmark seed={m.seed} />}
        </motion.div>
        {m.photo ? null : (
          <div aria-hidden="true" className="absolute inset-x-0 top-[44%] flex h-0 items-center justify-center">
            <motion.span
              className="f-display text-[clamp(2.6rem,6vw,4rem)] font-bold italic leading-none"
              animate={{ scale: hover ? 0.88 : 1, color: hover ? "#4E8A72" : "#1D2622" }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
            >
              {m.mark}
            </motion.span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#ECEDE8] via-[#ECEDE8]/10 to-transparent" />
        <div className="f-label absolute left-4 top-4 text-[11px] uppercase tracking-[0.25em] text-[#1D2622]/70">
          Клеймо {m.mark}·{m.years}
        </div>
        <motion.p
          className="f-display absolute inset-x-0 bottom-0 p-5 text-2xl font-semibold italic leading-tight text-[#1D2622]"
          initial={false}
          animate={{ y: hover ? "0%" : "105%", opacity: hover ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          «{m.quote}»
        </motion.p>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="f-display text-[2.3rem] font-bold leading-none">{m.name}</h3>
          <p className="f-label mt-2 text-[11px] uppercase tracking-[0.22em] text-[#2E5E4E]">{m.role}</p>
          <p className="f-label mt-1 text-[11px] uppercase tracking-[0.18em] text-[#1D2622]/55">
            {m.years} лет · {m.tool}
          </p>
        </div>
        <Magnetic strength={0.4}>
          <motion.button
            type="button"
            onClick={() => onBook(m.id)}
            aria-label={`Записаться к мастеру: ${m.name}`}
            whileHover={{ backgroundColor: "#2E5E4E", color: "#F7F7F3", rotate: 45 }}
            whileTap={{ scale: 0.9 }}
            transition={springSnappy}
            className="grid h-11 w-11 shrink-0 place-items-center border border-[#2E5E4E]/60 text-[#2E5E4E]"
          >
            <ArrowUpRight size={18} strokeWidth={1.5} />
          </motion.button>
        </Magnetic>
      </div>
    </motion.article>
  );
}

function Masters({ onBook }) {
  return (
    <section id="masters" className="relative scroll-mt-20 py-24 sm:py-32">
      <Container>
        <SectionHead
          eyebrow="[ Четыре мастера ]"
          title="Мастера"
          italic="своего дела"
          aside="У каждого мастера своё клеймо и свой главный инструмент. Наведите на карточку, чтобы прочитать, как он работает."
        />
        <div className="mt-14 grid gap-x-5 gap-y-12 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
          {MASTERS.map((m, i) => (
            <MasterCard key={m.id} m={m} index={i} onBook={onBook} />
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ───────────────────────────── Запись ───────────────────────────── */

function Chip({ active, onClick, children, group, disabled = false }) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      whileHover={disabled || active ? undefined : { borderColor: "rgba(46,94,78,0.7)", y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={springSnappy}
      className={`f-label relative isolate border px-3.5 py-2 text-[13px] tracking-[0.04em] ${
        active ? "border-[#2E5E4E] text-[#F7F7F3]" : "border-[#1D2622]/20 text-[#1D2622]/80"
      } ${disabled ? "cursor-not-allowed text-[#1D2622]/35 line-through" : ""}`}
    >
      {active ? (
        <motion.span layoutId={`pill-${group}`} className="absolute inset-0 -z-10 bg-[#2E5E4E]" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
      ) : null}
      {children}
    </motion.button>
  );
}

function Field({ step, label, error, children }) {
  return (
    <fieldset className="min-w-0">
      <legend className="f-label mb-3 flex w-full items-center gap-3 text-[11px] uppercase tracking-[0.26em] text-[#1D2622]/55">
        <span className="text-[#2E5E4E]">{step}</span>
        {label}
      </legend>
      {children}
      <AnimatePresence>
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="f-label mt-2 text-[12px] tracking-[0.06em] text-[#B4432F]"
            role="alert"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </fieldset>
  );
}

function MiniMap() {
  return (
    <svg viewBox="0 0 320 190" className="h-auto w-full" role="img" aria-label="Схема: Onix Barbershop рядом с дворцовым парком и рекой Сож">
      <rect width="320" height="190" fill="#E3E7E1" />
      <path d="M 300 -10 C 276 50 322 100 292 150 S 276 200 294 210" fill="none" stroke="#AFC3CA" strokeWidth="22" />
      <text x="304" y="128" className="f-label" fontSize="7" letterSpacing="1.4" fill="#4F6E79" transform="rotate(-80 304 128)">
        Р. СОЖ
      </text>
      <g stroke="#FFFFFF" strokeWidth="7" fill="none" strokeLinecap="square">
        <path d="M -10 40 L 330 110" />
        <path d="M 60 -10 L 110 200" />
        <path d="M 230 -10 L 205 200" />
      </g>
      <g stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="3.5" fill="none">
        <path d="M -10 150 L 330 175" />
        <path d="M 150 -10 L 160 200" />
      </g>
      <rect x="118" y="100" width="70" height="44" fill="#C7D6C8" stroke="#2E5E4E" strokeOpacity="0.3" />
      <g fill="#2E5E4E" fillOpacity="0.35">
        {Array.from({ length: 18 }, (_, i) => (
          <circle key={i} cx={127 + (i % 6) * 10.4 + (Math.floor(i / 6) % 2) * 5} cy={110 + Math.floor(i / 6) * 11} r="2.2" />
        ))}
      </g>
      <text x="153" y="158" textAnchor="middle" className="f-label" fontSize="7" letterSpacing="1.4" fill="#1D2622" fillOpacity="0.55">
        ДВОРЦОВЫЙ ПАРК
      </text>
      <text x="22" y="36" className="f-label" fontSize="7" letterSpacing="1.4" fill="#1D2622" fillOpacity="0.5" transform="rotate(11.6 22 36)">
        РУМЯНЦЕВСКАЯ
      </text>
      <motion.circle
        cx="214"
        cy="86"
        r="6"
        fill="none"
        stroke="#2E5E4E"
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: [1, 3.4], opacity: [0.8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
      />
      <circle cx="214" cy="86" r="5" fill="#2E5E4E" />
      <circle cx="214" cy="86" r="1.8" fill="#F7F7F3" />
      <text x="226" y="74" className="f-label" fontSize="8" letterSpacing="1.4" fill="#2E5E4E">
        ONIX · 21
      </text>
    </svg>
  );
}

function ContactRow({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-4 border-t border-[#1D2622]/15 py-5">
      <Icon size={18} strokeWidth={1.4} className="mt-0.5 shrink-0 text-[#2E5E4E]" />
      <div className="min-w-0 flex-1">
        <p className="f-label text-[11px] uppercase tracking-[0.24em] text-[#1D2622]/55">{label}</p>
        <div className="mt-1.5 text-[16px] text-[#1D2622]">{children}</div>
      </div>
    </div>
  );
}

function Booking({ sectionRef, service, setService, master, setMaster }) {
  const days = useMemo(buildDays, []);
  const masterKey = Math.max(0, MASTERS.findIndex((m) => m.id === master) + 1);
  const [dayIdx, setDayIdx] = useState(() => (TIMES.every((_, i) => isBusy(0, i, 0)) ? 1 : 0));
  const [time, setTime] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [ticket, setTicket] = useState(null);
  const [copied, setCopied] = useState(false);
  const phoneRef = useRef(null);
  const svc = SERVICES.find((s) => s.id === service) ?? SERVICES[0];
  const slots = useMemo(() => TIMES.map((t, i) => ({ t, busy: isBusy(dayIdx, i, masterKey) })), [dayIdx, masterKey]);

  useEffect(() => {
    if (time && slots.find((s) => s.t === time)?.busy) setTime(null);
  }, [slots, time]);

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(PHONE.replace(/[^\d+]/g, ""));
      setCopied("ok");
    } catch {
      const range = document.createRange();
      range.selectNodeContents(phoneRef.current);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      setCopied("select");
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!time) next.time = "Выберите свободное время";
    if (name.trim().length < 2) next.name = "Укажите имя";
    if (phone.replace(/\D/g, "").length !== 12) next.phone = "Введите номер полностью: +375 и 9 цифр";
    setErrors(next);
    if (Object.keys(next).length) return;
    setTicket({
      no: String(1000 + Math.floor(Math.random() * 9000)),
      svc,
      master: MASTERS.find((m) => m.id === master)?.name ?? "Любой свободный мастер",
      day: days[dayIdx].long,
      time,
      name: name.trim(),
      phone,
    });
  };

  return (
    <section id="booking" ref={sectionRef} className="relative scroll-mt-20 py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute right-[10%] top-[20%] h-[36vmax] w-[36vmax] rounded-full bg-[#2E5E4E]/10 blur-[120px]" />
      <Container className="grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal y={30}>
            <p className="f-label text-[12px] uppercase tracking-[0.22em] text-[#2E5E4E]">[ Запись и контакты ]</p>
          </Reveal>
          <h2 aria-label="Займите кресло" className="f-display mt-5 text-[clamp(3.6rem,12vw,9rem)] font-extrabold uppercase leading-[0.88]">
            <SplitLetters text="Займите" trigger="view" />{" "}
            <span className="italic text-[#2E5E4E]">
              <SplitLetters text="кресло" trigger="view" delay={0.2} />
            </span>
          </h2>
          <Reveal delay={0.1} y={40}>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[#1D2622]/70">
              Выберите услугу, мастера и время. Администратор перезвонит в течение 15 минут, чтобы подтвердить визит.
            </p>
          </Reveal>
          <Reveal delay={0.15} y={50} className="mt-10">
            <ContactRow icon={MapPin} label="Адрес">
              {ADDRESS}
              <span className="f-label mt-1 block text-[12px] uppercase tracking-[0.16em] text-[#1D2622]/55">5 минут пешком до дворцового парка</span>
            </ContactRow>
            <ContactRow icon={Clock} label="Часы работы">
              Ежедневно, 10:00–22:00
            </ContactRow>
            <ContactRow icon={Phone} label="Телефон">
              <div className="flex flex-wrap items-center gap-3">
                <span ref={phoneRef} className="select-all tabular-nums">
                  {PHONE}
                </span>
                <motion.button
                  type="button"
                  onClick={copyPhone}
                  whileTap={{ scale: 0.92 }}
                  className="f-label inline-flex items-center gap-1.5 border border-[#1D2622]/20 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-[#1D2622]/70"
                >
                  {copied === "ok" ? <Check size={12} className="text-[#2E5E4E]" /> : <Copy size={12} />}
                  {copied === "ok" ? "Скопировано" : copied === "select" ? "Выделено" : "Копировать"}
                </motion.button>
              </div>
            </ContactRow>
            <ContactRow icon={Send} label="Telegram">
              {TELEGRAM}
            </ContactRow>
            <div className="mt-2 border border-[#1D2622]/15">
              <MiniMap />
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal y={80} delay={0.1}>
            <div
              className="relative border border-[#1D2622]/15 bg-[#F7F7F3]/75 p-5 shadow-[0_40px_120px_-40px_rgba(29,38,34,0.16)] backdrop-blur-2xl sm:p-8 lg:p-10"
              style={{ perspective: 1400 }}
            >
              {/* Форма остаётся смонтированной: пилюли с layoutId блокируют exit у AnimatePresence. */}
              <motion.form
                onSubmit={submit}
                noValidate
                className="grid gap-9"
                initial={false}
                animate={ticket ? { opacity: 0, rotateX: -10, y: -24 } : { opacity: 1, rotateX: 0, y: 0 }}
                transition={ticket ? { duration: 0.35, ease: [0.4, 0, 1, 1] } : springSoft}
                aria-hidden={ticket ? true : undefined}
                inert={ticket ? "" : undefined}
              >
                <Field step="01" label="Услуга">
                  <div className="flex flex-wrap gap-2">
                    {SERVICES.map((s) => (
                      <Chip key={s.id} group="svc" active={service === s.id} onClick={() => setService(s.id)}>
                        {s.title}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field step="02" label="Мастер">
                  <div className="flex flex-wrap gap-2">
                    <Chip group="master" active={master === "any"} onClick={() => setMaster("any")}>
                      Любой мастер
                    </Chip>
                    {MASTERS.map((m) => (
                      <Chip key={m.id} group="master" active={master === m.id} onClick={() => setMaster(m.id)}>
                        {m.name}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field step="03" label="День">
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {days.map((d, i) => (
                      <Chip key={d.key} group="day" active={dayIdx === i} onClick={() => setDayIdx(i)}>
                        <span className="block text-[9px] uppercase tracking-[0.16em] opacity-70">{d.label}</span>
                        <span className="f-display block text-2xl font-bold leading-tight">{d.day}</span>
                        <span className="block text-[9px] uppercase tracking-[0.16em] opacity-70">{d.month}</span>
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field step="04" label="Время" error={errors.time}>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {slots.map((s) => (
                      <Chip key={s.t} group="time" active={time === s.t} disabled={s.busy} onClick={() => setTime(s.t)}>
                        <span className="tabular-nums">{s.t}</span>
                      </Chip>
                    ))}
                  </div>
                </Field>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field step="05" label="Имя" error={errors.name}>
                    <input
                      id="bk-name"
                      name="name"
                      autoComplete="given-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Как к вам обращаться"
                      aria-label="Имя"
                      className="w-full border-b border-[#1D2622]/25 bg-transparent py-3 text-[17px] text-[#1D2622] outline-none focus:border-[#2E5E4E]"
                    />
                  </Field>
                  <Field step="06" label="Телефон" error={errors.phone}>
                    <input
                      id="bk-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="+375 (__) ___-__-__"
                      aria-label="Телефон"
                      className="w-full border-b border-[#1D2622]/25 bg-transparent py-3 text-[17px] tabular-nums text-[#1D2622] outline-none focus:border-[#2E5E4E]"
                    />
                  </Field>
                </div>
                <div className="flex flex-col gap-6 border-t border-[#1D2622]/15 pt-7 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="f-label text-[11px] uppercase tracking-[0.24em] text-[#1D2622]/55">Итого</p>
                    <motion.p
                      key={svc.id}
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={springSnappy}
                      className="f-display mt-1 text-5xl font-bold"
                    >
                      {fmtPrice(svc.price)}
                      <span className="f-label ml-3 text-[12px] font-normal uppercase tracking-[0.18em] text-[#1D2622]/55">{svc.time} мин</span>
                    </motion.p>
                  </div>
                  <PrimaryButton type="submit">Подтвердить запись</PrimaryButton>
                </div>
              </motion.form>
              <AnimatePresence>
                {ticket ? (
                  <div key="ticket" className="absolute inset-0 flex items-center p-5 sm:p-8 lg:p-10">
                    <Ticket ticket={ticket} onEdit={() => setTicket(null)} />
                  </div>
                ) : null}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function Ticket({ ticket, onEdit }) {
  const rows = [
    ["Услуга", ticket.svc.title],
    ["Мастер", ticket.master],
    ["Дата", ticket.day],
    ["Время", ticket.time],
    ["Гость", ticket.name],
    ["Телефон", ticket.phone],
  ];
  return (
    <motion.div
      initial={{ opacity: 0, rotateX: -70, y: -40 }}
      animate={{ opacity: 1, rotateX: 0, y: 0 }}
      exit={{ opacity: 0, rotateX: 40, y: 30, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }}
      transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.2 }}
      style={{ transformOrigin: "50% 0%" }}
      className="w-full"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="f-label text-[11px] uppercase tracking-[0.2em] text-[#2E5E4E]">Запись сформирована</p>
          <h3 className="f-display mt-2 text-5xl font-bold leading-none">Талон № {ticket.no}</h3>
        </div>
        <motion.span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#2E5E4E] text-[#F7F7F3]"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.25 }}
        >
          <Check size={24} />
        </motion.span>
      </div>
      <div className="relative my-8 h-px border-t border-dashed border-[#1D2622]/25">
        <span className="absolute -left-8 -top-3 h-6 w-6 rounded-full bg-[#ECEDE8] sm:-left-11 lg:-left-[3.25rem]" />
        <span className="absolute -right-8 -top-3 h-6 w-6 rounded-full bg-[#ECEDE8] sm:-right-11 lg:-right-[3.25rem]" />
      </div>
      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {rows.map(([k, v], i) => (
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springSnappy, delay: 0.2 + i * 0.06 }}
            className="min-w-0"
          >
            <dt className="f-label text-[11px] uppercase tracking-[0.24em] text-[#1D2622]/55">{k}</dt>
            <dd className="mt-1 break-words text-[17px] text-[#1D2622]">{v}</dd>
          </motion.div>
        ))}
      </dl>
      <div className="mt-8 flex flex-col gap-6 border-t border-[#1D2622]/15 pt-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="f-label text-[11px] uppercase tracking-[0.24em] text-[#1D2622]/55">К оплате в барбершопе</p>
          <p className="f-display mt-1 text-5xl font-bold">{fmtPrice(ticket.svc.price)}</p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="f-label self-start border border-[#1D2622]/25 px-5 py-3 text-[12px] uppercase tracking-[0.2em] text-[#1D2622]/80 sm:self-auto"
        >
          Изменить запись
        </button>
      </div>
      <p className="f-label mt-6 text-[11px] uppercase leading-relaxed tracking-[0.16em] text-[#1D2622]/50">Демо-страница: заявка никуда не отправляется.</p>
    </motion.div>
  );
}

/* ───────────────────────────── Подвал ───────────────────────────── */

function Footer({ onNav }) {
  return (
    <footer className="relative overflow-hidden border-t border-[#1D2622]/15 pt-20">
      <Container className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="f-display text-4xl font-extrabold uppercase tracking-[0.03em]">Onix Barbershop</p>
          <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-[#1D2622]/60">
            Мужской барбершоп в центре Гомеля, рядом с дворцовым парком. Стрижки, бритьё и уход за бородой по записи.
          </p>
        </div>
        <div>
          <p className="f-label text-[11px] uppercase tracking-[0.24em] text-[#1D2622]/55">Адрес</p>
          <p className="mt-2 text-[15px] text-[#1D2622]/85">{ADDRESS}</p>
        </div>
        <div>
          <p className="f-label text-[11px] uppercase tracking-[0.24em] text-[#1D2622]/55">Часы</p>
          <p className="mt-2 text-[15px] text-[#1D2622]/85">Ежедневно, 10:00–22:00</p>
        </div>
        <div>
          <p className="f-label text-[11px] uppercase tracking-[0.24em] text-[#1D2622]/55">Связь</p>
          <p className="mt-2 select-all text-[15px] tabular-nums text-[#1D2622]/85">{PHONE}</p>
          <p className="text-[15px] text-[#1D2622]/85">{TELEGRAM}</p>
        </div>
      </Container>
      <div className="f-display mt-16 select-none text-center text-[42vw] font-extrabold leading-[0.78] tracking-[-0.01em]" aria-hidden="true">
        <SplitLetters text="ONIX" trigger="view" stagger={0.07} letterClassName="accent-text" />
      </div>
      <Container className="f-label flex flex-col gap-4 border-t border-[#1D2622]/15 py-6 text-[11px] uppercase tracking-[0.2em] text-[#1D2622]/55 sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 Onix Barbershop</span>
        <span>Сделано с точностью до 0,5 мм</span>
        <motion.button
          type="button"
          onClick={() => onNav("top")}
          whileHover={{ y: -3, color: "#2E5E4E" }}
          transition={springSnappy}
          className="inline-flex items-center gap-2 self-start uppercase sm:self-auto"
        >
          Наверх
          <ArrowDown size={12} className="rotate-180" />
        </motion.button>
      </Container>
    </footer>
  );
}

/* ─────────────────────── Плавающий бейдж «Записаться» ───────────── */

function BookBadge({ hidden, onClick }) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { stiffness: 300, damping: 50 });
  const rotate = useMotionValue(0);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 150, damping: 12 });
  const smy = useSpring(my, { stiffness: 150, damping: 12 });
  const ref = useRef(null);
  const bounds = useRef(null);
  const dragged = useRef(false);
  const [past, setPast] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setPast(v > window.innerHeight * 0.45));
  const off = hidden || !past;

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    const v = smooth.get();
    const speed = 16 + Math.min(Math.abs(v), 4000) * 0.07;
    rotate.set(rotate.get() + (v < -5 ? -1 : 1) * speed * (delta / 1000));
  });

  useEffect(() => {
    const onMove = (e) => {
      if (e.pointerType !== "mouse" || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < 170;
      mx.set(near ? dx * 0.3 : 0);
      my.set(near ? dy * 0.3 : 0);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  return (
    <>
      <div ref={bounds} aria-hidden="true" className="pointer-events-none fixed inset-3" style={{ bottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }} />
      <motion.div
        ref={ref}
        drag
        dragConstraints={bounds}
        dragElastic={0.2}
        dragTransition={{ bounceStiffness: 260, bounceDamping: 16 }}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={() => {
          setTimeout(() => {
            dragged.current = false;
          }, 60);
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: off ? 0 : 1, opacity: off ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="fixed right-4 z-[60] h-20 w-20 sm:right-6 sm:h-28 sm:w-28"
        style={{ bottom: "calc(20px + env(safe-area-inset-bottom, 0px))", touchAction: "none", pointerEvents: off ? "none" : "auto" }}
        data-cursor="drag"
      >
        <motion.button
          type="button"
          onClick={() => {
            if (!dragged.current) onClick();
          }}
          aria-label="Записаться онлайн"
          style={{ x: smx, y: smy }}
          initial="rest"
          animate="rest"
          whileHover="hover"
          whileTap={{ scale: 0.92 }}
          className="relative grid h-full w-full place-items-center rounded-full"
        >
          <motion.span
            className="absolute inset-0 rounded-full border bg-[#F7F7F3]/70 backdrop-blur-md"
            variants={{
              rest: { borderColor: "rgba(46,94,78,0.4)", boxShadow: "0 0 0px rgba(46,94,78,0)" },
              hover: { borderColor: "rgba(46,94,78,1)", boxShadow: "0 0 40px rgba(46,94,78,0.45)" },
            }}
          />
          <motion.svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ rotate }} aria-hidden="true">
            <path id="gr-badge-path" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" fill="none" />
            <text className="f-label" fontSize="8" letterSpacing="0.15" fill="#2E5E4E">
              <textPath href="#gr-badge-path" textLength="236" lengthAdjust="spacing">
                ЗАПИСАТЬСЯ · BOOK NOW · ЗАПИСАТЬСЯ · BOOK NOW ·
              </textPath>
            </text>
          </motion.svg>
          <motion.span
            className="relative grid h-9 w-9 place-items-center rounded-full bg-[#2E5E4E] text-[#F7F7F3] sm:h-12 sm:w-12"
            variants={{ rest: { scale: 1, rotate: 0 }, hover: { scale: 1.12, rotate: -30 } }}
            transition={{ type: "spring", stiffness: 300, damping: 12 }}
          >
            <Scissors size={18} strokeWidth={1.6} />
          </motion.span>
        </motion.button>
      </motion.div>
    </>
  );
}

/* ───────────────────────────── Страница ─────────────────────────── */

export default function BarbershopLanding() {
  const [loading, setLoading] = useState(() => typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [service, setService] = useState("signature");
  const [master, setMaster] = useState("any");
  const bookingRef = useRef(null);
  const bookingInView = useInView(bookingRef, { amount: 0.2 });
  const finishLoading = useCallback(() => setLoading(false), []);

  const go = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = loading ? "hidden" : "";
    if (!loading) requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [loading]);

  return (
    <MotionConfig reducedMotion="user">
      <GlobalStyles />
      <div className="f-body relative min-h-screen overflow-x-clip bg-[#ECEDE8] text-[#1D2622]">
        <SvgDefs />
        <div className="grain" aria-hidden="true" />
        <AnimatePresence>{loading ? <Loader key="loader" onDone={finishLoading} /> : null}</AnimatePresence>
        <Cursor />
        <Nav ready={!loading} onNav={go} />
        <main>
          <Hero ready={!loading} onNav={go} />
          <MarqueeBand />
          <Manifesto />
          <Services
            onSelect={(id) => {
              setService(id);
              go("booking");
            }}
          />
          <Ritual />
          <Masters
            onBook={(id) => {
              setMaster(id);
              go("booking");
            }}
          />
          <Booking sectionRef={bookingRef} service={service} setService={setService} master={master} setMaster={setMaster} />
        </main>
        <Footer onNav={go} />
        <BookBadge hidden={loading || bookingInView} onClick={() => go("booking")} />
      </div>
    </MotionConfig>
  );
}
