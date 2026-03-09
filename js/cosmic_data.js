// ============================================================
//  COSMIC DATA — Zodiac, Archetypes, and Calculation Helpers
// ============================================================

// ── Julian Day ──────────────────────────────────────────────
function julianDay(year, month, day, hour) {
    if (month <= 2) { year -= 1; month += 12; }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + hour / 24.0 + B - 1524.5;
}

// ── Moon Sign Index (0=Aries … 11=Pisces) ───────────────────
// Moon at ~113.8° on Jan 1 2000 12:00 UT. Moves 13.17635°/day.
function getMoonSignIndex(year, month, day, hour) {
    const ref = julianDay(2000, 1, 1, 12);
    const birth = julianDay(parseInt(year), parseInt(month), parseInt(day), hour || 12);
    const moonLon = ((113.8 + (birth - ref) * 13.17635) % 360 + 360) % 360;
    return Math.floor(moonLon / 30);
}

// ── Rising Sign Index ────────────────────────────────────────
// Uses simplified Local Sidereal Time + longitude.
function getRisingSignIndex(year, month, day, hour, minute, lng) {
    const jd = julianDay(parseInt(year), parseInt(month), parseInt(day), hour + minute / 60.0);
    let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0);
    GMST = ((GMST % 360) + 360) % 360;
    const LST = ((GMST + parseFloat(lng || 0)) % 360 + 360) % 360;
    return Math.floor(LST / 30);
}

// ── Local Sidereal Time string ───────────────────────────────
function getLocalSiderealTime(year, month, day, hour, minute, lng) {
    const jd = julianDay(parseInt(year), parseInt(month), parseInt(day), hour + minute / 60.0);
    let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0);
    GMST = ((GMST % 360) + 360) % 360;
    const LST_deg = ((GMST + parseFloat(lng || 0)) % 360 + 360) % 360;
    const LST_h = LST_deg / 15;
    const h = Math.floor(LST_h);
    const m = Math.floor((LST_h - h) * 60);
    const s = Math.floor(((LST_h - h) * 60 - m) * 60);
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

// ── Zodiac Table ─────────────────────────────────────────────
const ZODIAC = [
    { name: 'Aries', glyph: '♈', color: '#ff7755' },
    { name: 'Taurus', glyph: '♉', color: '#88cc66' },
    { name: 'Gemini', glyph: '♊', color: '#aaddff' },
    { name: 'Cancer', glyph: '♋', color: '#5599ee' },
    { name: 'Leo', glyph: '♌', color: '#ffcc33' },
    { name: 'Virgo', glyph: '♍', color: '#99cc77' },
    { name: 'Libra', glyph: '♎', color: '#cc99ff' },
    { name: 'Scorpio', glyph: '♏', color: '#8855cc' },
    { name: 'Sagittarius', glyph: '♐', color: '#ff9944' },
    { name: 'Capricorn', glyph: '♑', color: '#77aa88' },
    { name: 'Aquarius', glyph: '♒', color: '#66bbff' },
    { name: 'Pisces', glyph: '♓', color: '#9977ee' },
];

function getSunSignIndex(month, day) {
    const m = parseInt(month), d = parseInt(day);
    if ((m == 3 && d >= 21) || (m == 4 && d <= 19)) return 0;
    if ((m == 4 && d >= 20) || (m == 5 && d <= 20)) return 1;
    if ((m == 5 && d >= 21) || (m == 6 && d <= 20)) return 2;
    if ((m == 6 && d >= 21) || (m == 7 && d <= 22)) return 3;
    if ((m == 7 && d >= 23) || (m == 8 && d <= 22)) return 4;
    if ((m == 8 && d >= 23) || (m == 9 && d <= 22)) return 5;
    if ((m == 9 && d >= 23) || (m == 10 && d <= 22)) return 6;
    if ((m == 10 && d >= 23) || (m == 11 && d <= 21)) return 7;
    if ((m == 11 && d >= 22) || (m == 12 && d <= 21)) return 8;
    if ((m == 12 && d >= 22) || (m == 1 && d <= 19)) return 9;
    if ((m == 1 && d >= 20) || (m == 2 && d <= 18)) return 10;
    return 11;
}

// ── HD Type Glyphs ───────────────────────────────────────────
const HD_GLYPHS = {
    'Manifestor': { glyph: '⚡', color: '#ff7755' },
    'Generator': { glyph: '🔆', color: '#ffcc33' },
    'Manifesting Generator': { glyph: '✦', color: '#ff9944' },
    'Projector': { glyph: '◎', color: '#b14bf4' },
    'Reflector': { glyph: '◯', color: '#aaddff' },
};

// ── 60 Cosmic Archetypes (Sun Sign × HD Type) ────────────────
const COSMIC_ARCHETYPES = {
    Aries: {
        Manifestor: { title: 'The Ignitor', desc: 'Born to initiate without permission, you are the cosmic flare that sets entire movements ablaze. Your power is not earned — it is declared. The universe moves when you do.' },
        Generator: { title: 'The Relentless', desc: 'No one outworks you when your sacral ignites. Your fire burns toward what excites it with unstoppable momentum. Rest is sacred — it fills the engine for what comes next.' },
        'Manifesting Generator': { title: 'The Flash Storm', desc: 'Fast, multi-directional, and explosive — you leave trails of brilliant beginnings wherever you go. The world struggles to keep up. That is not your problem.' },
        Projector: { title: 'The Scout', desc: 'You see the battlefield before the battle begins. Strategy born of instinct is your gift. Wait for the invitation, then direct with precision.' },
        Reflector: { title: 'The Sacred Mirror', desc: 'Where others charge ahead, you reflect what is truly happening. Your rare presence shows systems their own blind spots. The cosmos speaks through your stillness.' },
    },
    Taurus: {
        Manifestor: { title: 'The Architect', desc: 'You build permanent things with unstoppable force. Once your vision solidifies, the universe moves to accommodate it. You do not rush — you install.' },
        Generator: { title: 'The Sustainer', desc: 'Slow to start but impossible to stop, you build with sensory mastery and patient devotion. Your work becomes craft. Your craft becomes legacy.' },
        'Manifesting Generator': { title: 'The Force of Nature', desc: 'Unstoppable and multi-talented, you build beautiful empires through sheer sensory-driven momentum. Bold and grounded at once — nothing you construct falls apart.' },
        Projector: { title: 'The Steward', desc: 'Your ability to guide others toward enduring beauty and sustainable rhythm is unmatched. You see what will last — and you protect it with quiet precision.' },
        Reflector: { title: 'The Earth Mirror', desc: 'You reflect the endurance and beauty of the environments you inhabit. Stable and subtly perceptive, you are the truest gauge of how grounded a space truly is.' },
    },
    Gemini: {
        Manifestor: { title: 'The Messenger', desc: 'Words fall from you like lightning — each one reshaping the room. You speak things into being before others have finished thinking them. Silence is not your medium.' },
        Generator: { title: 'The Storyteller', desc: 'Your sacral responds to ideas, conversation, and unexpected connections. You build worlds through language and are energized by conversations that take surprising turns.' },
        'Manifesting Generator': { title: 'The Multi-Mind', desc: 'You process faster than most think and do faster than most process. Your genius lies in the skip — connecting dots that are invisible to everyone else in the room.' },
        Projector: { title: 'The Translator', desc: 'You interpret between worlds — making complex ideas accessible and helping others see themselves more clearly through the precision and poetry of your language.' },
        Reflector: { title: 'The Living Prism', desc: 'You reflect the world\'s ideas back with crystalline clarity and unexpected angles. Every conversation leaves something in you. Your wisdom is inherently collective.' },
    },
    Cancer: {
        Manifestor: { title: 'The Protector', desc: 'You initiate from the heart, wielding emotional truth like a shield. Your power creates safety for those who cannot yet protect themselves. Love is your authority.' },
        Generator: { title: 'The Nurturer', desc: 'You generate greatest when working in service of those you love. Energy flows through feeling first, then doing. The hearth you tend becomes a haven for all.' },
        'Manifesting Generator': { title: 'The Tidal Wave', desc: 'Emotional and powerful, you move mountains when your heart is fully engaged. Your multitasking is held together by intuition, not strategy — and it always works.' },
        Projector: { title: 'The Heart Guide', desc: 'You read the emotional room before anyone has spoken. Your guidance comes from tender, accurate attunement. The right words at the right moment are your signature.' },
        Reflector: { title: 'The Moon Pool', desc: 'Deeply lunar and deeply feeling, you are the reflection of collective emotional weather. Your insight arrives in waves — patient with the tides, never lost in them.' },
    },
    Leo: {
        Manifestor: { title: 'The Sovereign', desc: 'Command is your native language and radiance your medium. You do not request the spotlight — the spotlight finds you. Lead from your center and worlds rearrange.' },
        Generator: { title: 'The Performer', desc: 'Your sacral is a creative engine running on authentic expression. When you love what you do, you become something genuinely rare: unstoppable joy in human form.' },
        'Manifesting Generator': { title: 'The Dynamo', desc: 'Creative power with dramatic flair — you do ten things at once and make each one look effortless. You are the show, the producer, and the director simultaneously.' },
        Projector: { title: 'The Director', desc: 'You see gifts in others before they recognize them in themselves. Your recognition is transformational — the spotlight you hand to the right person changes their life.' },
        Reflector: { title: 'The Showcase', desc: 'You reflect the creativity and light of your environment at amplified intensity. You are the audience that makes performance matter and the mirror that reveals brilliance.' },
    },
    Virgo: {
        Manifestor: { title: 'The Adjuster', desc: 'You see exactly what is wrong and move to fix it before anyone else notices the problem. Precision and power wielded with quiet authority are your signature.' },
        Generator: { title: 'The Craftsman', desc: 'Excellence is not a standard you impose — it is simply what emerges when your sacral is fully engaged. For you, every detail is not an obstacle but an act of devotion.' },
        'Manifesting Generator': { title: 'The Surgeon', desc: 'Precise, rapid, and efficient — you skip the unnecessary and arrive at the essential. Your multitasking has a method hidden inside it that others cannot reverse-engineer.' },
        Projector: { title: 'The Systems Guide', desc: 'You see inefficiencies and improvements no one else notices. When invited, your guidance does not just help — it transforms the entire operating architecture.' },
        Reflector: { title: 'The Accuracy Mirror', desc: 'You reflect the health or dysfunction of systems with uncanny precision. No one else shows an organization its own shadow so clearly. Discernment is your superpower.' },
    },
    Libra: {
        Manifestor: { title: 'The Diplomat', desc: 'You initiate harmony — shaping social worlds with an elegant force others rarely see coming. Peace is your declaration. Beauty is your most potent strategy.' },
        Generator: { title: 'The Harmonizer', desc: 'Your energy flows most freely when building environments of beauty and balance. Relationship is your fuel. When the dynamic is right, nothing can slow you down.' },
        'Manifesting Generator': { title: 'The Social Architect', desc: 'You build webs of beauty and connection at speed. Multi-talented and relationally gifted, you create harmony in motion — and make the entire thing look like art.' },
        Projector: { title: 'The Mediator', desc: 'Your deep understanding of relational dynamics makes you ideal in complexity and conflict. You find the third option no one else imagined — and make it obvious.' },
        Reflector: { title: 'The Cosmic Scale', desc: 'You sample the balance of relationships and reflect it back without distortion. Justice lives in your awareness — and the room always, somehow, knows it.' },
    },
    Scorpio: {
        Manifestor: { title: 'The Alchemist', desc: 'Your initiations transform what they touch at a cellular level. The power you carry is ancient and rarely fully visible, even to yourself. You remake what you touch.' },
        Generator: { title: 'The Transformer', desc: 'Your sacral runs deep beneath the surface, energized by mystery. What you build cannot easily be undone. You forge things that outlast their moment of creation.' },
        'Manifesting Generator': { title: 'The Catalyst', desc: 'Intense, multi-layered, and transformative — your multi-directional power reshapes everything it encounters, often without a single word being spoken aloud.' },
        Projector: { title: 'The Depth Reader', desc: 'You see beneath surfaces and into the true mechanics of situations. Invited truth-tellers who rarely speak — but when you do, it lands exactly where it needs to.' },
        Reflector: { title: 'The Deep Mirror', desc: 'You reflect hidden currents of power and transformation with uncanny accuracy. What you perceive in others takes time to integrate — your patience is your wisdom.' },
    },
    Sagittarius: {
        Manifestor: { title: 'The Crusader', desc: 'You launch truths like arrows aimed at distant horizons others have not yet perceived. Movement is your prayer. The road ahead is always more real than the one behind.' },
        Generator: { title: 'The Adventurer', desc: 'Your sacral ignites when pointed toward new horizons. Philosophy, travel, and expansive ideas are the fires that keep your engine burning at maximum capacity.' },
        'Manifesting Generator': { title: 'The Expedition', desc: 'You turn life into an adventure multiplied across dimensions. Multiple paths, multiple truths — always expanding beyond what was thought possible the day before.' },
        Projector: { title: 'The Wayfinder', desc: 'You synthesize wisdom from vast experience and offer it as a lantern to the lost. Your maps are drawn from meaning, not miles. Seek those who truly want direction.' },
        Reflector: { title: 'The Traveling Mirror', desc: 'As you move through the world, you absorb and reflect the truth of wherever you land. Your wisdom is your wandering. Stay curious — movement keeps your lens clear.' },
    },
    Capricorn: {
        Manifestor: { title: 'The Constructor', desc: 'Your legacy is built brick by quiet brick, each placed with an authority that requires no announcement. Time is reliably on your side. Patience is your sharpest power.' },
        Generator: { title: 'The Builder', desc: 'Patient, persistent, impossible to deter — you generate through commitment compounded over time. Your work does not simply succeed. It endures across generations.' },
        'Manifesting Generator': { title: 'The Architect General', desc: 'You build fast, course-correct mid-stream, and still arrive ahead of schedule. Your ambition has no ceiling — and your discipline has absolutely no cracks.' },
        Projector: { title: 'The Mentor', desc: 'Patient and precise, you guide others up mountains you have quietly studied for years. Your timing is your greatest asset. You move only when the moment is undeniable.' },
        Reflector: { title: 'The Chronicler', desc: 'You reflect the long arc of collective effort and legacy with uncommon clarity. Where others see the fleeting moment, you perceive the unfolding century.' },
    },
    Aquarius: {
        Manifestor: { title: 'The Revolutionary', desc: 'You initiate the future before the present has fully settled. Your ideas are seeds planted in centuries ahead. The collective did not know it needed you — not yet.' },
        Generator: { title: 'The Innovator', desc: 'You are energized by the unusual, the collective, and the future not yet arrived. When your sacral says yes to a vision, the ripples extend far beyond the room.' },
        'Manifesting Generator': { title: 'The Innovation Bolt', desc: 'Future-oriented and multi-dimensional, you download innovations at speed and implement them before others have finished their first sentence about the problem.' },
        Projector: { title: 'The Cultural Guide', desc: 'You perceive the collective pattern — what needs to shift, what is arriving next. When invited, your vision becomes the compass of entire communities and movements.' },
        Reflector: { title: 'The Collective Gauge', desc: 'You are the living barometer of humanity\'s health. What you feel, the collective is feeling — though most have not yet found the words to name it themselves.' },
    },
    Pisces: {
        Manifestor: { title: 'The Oracle', desc: 'Your initiations come through dream and deep intuition — acts of creation that seem to flow from beyond yourself. You are a conduit, not fully of this dimension alone.' },
        Generator: { title: 'The Vessel', desc: 'Your energy flows through imagination and spiritual attunement. You are a channel for something larger than yourself, and the work you love most always reflects this.' },
        'Manifesting Generator': { title: 'The Dream Weaver', desc: 'You create from multiple dimensions simultaneously — imagination, intuition, and action all running through you at once. The boundaries of possible do not apply to you.' },
        Projector: { title: 'The Mystic Guide', desc: 'You read between the lines of reality itself. Your guidance comes from sources that cannot be explained — and in your case, they rarely need to be.' },
        Reflector: { title: 'The Cosmic Mirror', desc: 'The most spiritually permeable of all configurations, you reflect the cosmos back to itself. You are rare, deeply magical, and not entirely of only this dimension.' },
    },
};
