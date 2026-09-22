import { doubleMetaphone } from 'double-metaphone';
import { distance } from 'fastest-levenshtein';
import { compareTwoStrings } from 'string-similarity';

export type DosageForm =
    | 'tablet'
    | 'capsule'
    | 'inhaler'
    | 'rotacap'
    | 'respule'
    | 'injection'
    | 'syrup'
    | 'suspension'
    | 'cream'
    | 'ointment'
    | 'gel'
    | 'drops'
    | 'spray'
    | 'powder'
    | 'solution'
    | 'patch'
    | 'unknown';

export interface StrengthComponent {
    position: number;
    value: number;
    unit: string | null;
}

export interface ParsedDrugIdentity {
    normalized_name: string;
    compact_name: string;
    compact_identity: string;
    brand_root: string;
    dosage_form: DosageForm;
    release_types: string[];
    qualifiers: string[];
    strength_components: StrengthComponent[];
    phonetic_codes: string[];
    parse_status: string;
}

export interface IndexedDrug extends ParsedDrugIdentity {
    id: number;
    brand_name: string;
    salt: string;
}

export interface MatchRequest {
    spoken_name: string;
    strength?: string;
    dosage_form?: string;
    route?: string;
    source_text?: string;
    instructions?: string;
    qualifiers?: string[];
    release_type?: string | string[];
    strength_components?: StrengthComponent[];
}

export interface RankedDrugCandidate {
    id: number;
    brand_name: string;
    salt: string;
    score: number;
    confidence: number;
    match_type: 'Exact' | 'Alias' | 'Compact' | 'Phonetic' | 'Near-Phonetic' | 'Fuzzy';
    phonetic_code: string;
    dosage_form: DosageForm;
    qualifiers: string[];
    release_types: string[];
    strength_components: StrengthComponent[];
    compatible: boolean;
    auto_selectable: boolean;
    evidence: string[];
    conflicts: string[];
    review_reasons: string[];
}

export interface DrugMatchIndex {
    list: IndexedDrug[];
    byBrandRoot: Map<string, IndexedDrug[]>;
    byCompactName: Map<string, IndexedDrug[]>;
    byCompactIdentity: Map<string, IndexedDrug[]>;
    byInitial: Map<string, IndexedDrug[]>;
    byPhonetic: Map<string, IndexedDrug[]>;
    aliasesByNormalized: Map<string, IndexedDrug>;
    aliasesByCompact: Map<string, IndexedDrug>;
    phoneticKeys: string[];
    // Maps every one-character deletion of a phonetic key back to its source keys.
    // This makes edit-distance-one lookup proportional to the query length, rather
    // than to every phonetic key in the catalogue.
    phoneticKeysByDeletion: Map<string, string[]>;
}

const FORM_PATTERNS: Array<[DosageForm, RegExp]> = [
    ['respule', /\brespules?\b|\bnebul(?:izer|iser)?\b/i],
    ['rotacap', /\brotacaps?\b/i],
    ['inhaler', /\binhalers?\b|\bautohaler\b|\bsynchrobreathe\b|\bmultihaler\b|\bciphaler\b/i],
    ['injection', /\binjections?\b|\binjectable\b/i],
    ['tablet', /\btablets?\b|\bodt\b/i],
    ['capsule', /\bcapsules?\b|\bsoftgels?\b/i],
    ['syrup', /\bsyrups?\b/i],
    ['suspension', /\bsuspensions?\b/i],
    ['cream', /\bcreams?\b/i],
    ['ointment', /\bointments?\b/i],
    ['gel', /\bgels?\b/i],
    ['drops', /\bdrops?\b/i],
    ['spray', /\bsprays?\b/i],
    ['powder', /\bpowders?\b/i],
    ['solution', /\bsolutions?\b/i],
    ['patch', /\bpatch(?:es)?\b/i],
];

const FORM_TOKENS = new Set([
    'tablet', 'tablets', 'capsule', 'capsules', 'injection', 'injections', 'injectable',
    'syrup', 'syrups', 'suspension', 'suspensions', 'cream', 'creams', 'ointment',
    'ointments', 'gel', 'gels', 'drop', 'drops', 'spray', 'sprays', 'powder', 'powders',
    'solution', 'solutions', 'patch', 'patches', 'respule', 'respules', 'inhaler', 'inhalers',
    'rotacap', 'rotacaps', 'autohaler', 'synchrobreathe', 'multihaler', 'ciphaler', 'nebulizer',
    'nebuliser', 'oral', 'softgel', 'softgels',
]);

const RELEASE_TOKENS = new Set(['sr', 'er', 'xr', 'cr', 'mr', 'pr', 'dr', 'md', 'odt', 'retard']);
const UNIT_TOKENS = new Set(['mg', 'mcg', 'g', 'gm', 'ml', 'iu', 'units', 'unit', 'percent']);
const PRESENTATION_TOKENS = new Set([
    'orange', 'mango', 'mint', 'lemon', 'strawberry', 'raspberry', 'vanilla', 'mixed', 'fruit',
    'sugar', 'free', 'each', 'single', 'use', 'cfc', 'flavour', 'flavor', 'juicy', 'dry', 'effervescent',
]);

const FORM_ALIASES: Record<string, DosageForm> = {
    tab: 'tablet', tablet: 'tablet', tablets: 'tablet',
    cap: 'capsule', capsule: 'capsule', capsules: 'capsule',
    inhaler: 'inhaler', inhalation: 'inhaler',
    rotacap: 'rotacap', respule: 'respule', nebulization: 'respule',
    injection: 'injection', injectable: 'injection', iv: 'injection', im: 'injection',
    syrup: 'syrup', suspension: 'suspension', cream: 'cream', ointment: 'ointment',
    gel: 'gel', drops: 'drops', drop: 'drops', spray: 'spray', powder: 'powder',
    solution: 'solution', patch: 'patch', oral: 'unknown',
};

export function normalizeIdentityText(value: string) {
    return String(value || '')
        .toLowerCase()
        .replace(/\b(gp|gm|mp)\s*[-/]?\s*(\d+)\b/g, '$1$2')
        .replace(/\b(p)\s*\+\s*(p)\b/g, 'p+p')
        .replace(/[^a-z0-9.+/]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function compactIdentityText(value: string) {
    return normalizeIdentityText(value).replace(/[^a-z0-9]+/g, '');
}

export function inferDosageForm(value: string): DosageForm {
    for (const [form, pattern] of FORM_PATTERNS) {
        if (pattern.test(value)) return form;
    }
    return 'unknown';
}

export function normalizeRequestedForm(value: string): DosageForm {
    const normalized = normalizeIdentityText(value);
    const direct = FORM_ALIASES[normalized];
    if (direct) return direct;
    return inferDosageForm(value);
}

export function routeForForm(form: DosageForm) {
    if (['tablet', 'capsule', 'syrup', 'suspension', 'powder', 'solution'].includes(form)) return 'oral';
    if (['inhaler', 'rotacap', 'respule'].includes(form)) return 'inhalation';
    if (['cream', 'ointment', 'gel', 'patch'].includes(form)) return 'topical';
    if (['drops', 'spray'].includes(form)) return 'local';
    if (form === 'injection') return 'injection';
    return 'unknown';
}

function normalizeUnit(unit: string | null | undefined) {
    if (!unit) return null;
    const normalized = unit.toLowerCase();
    if (normalized === 'gm') return 'g';
    if (normalized === '%') return 'percent';
    return normalized;
}

export function parseStrengthComponents(value: string): StrengthComponent[] {
    const text = String(value || '')
        .toLowerCase()
        .replace(/\b(gp|gm|mp)\s*[-/]?\s*(\d+)\b/g, '$1$2')
        .replace(/\bpoint\b/g, '.')
        .replace(/\boblique\b/g, '/');
    const matches = [...text.matchAll(/(?<![a-z])(\d+(?:\.\d+)?)\s*(mcg|mg|gm|g|ml|iu|units?|%)?(?![a-z])/gi)];
    const components = matches.map((match, index) => ({
        position: index + 1,
        value: Number(match[1]),
        unit: normalizeUnit(match[2]),
    })).filter((component) => Number.isFinite(component.value));

    // A trailing unit in a slash-separated strength applies to all preceding components.
    if (text.includes('/') && components.some((component) => component.unit)) {
        const sharedUnit = [...components].reverse().find((component) => component.unit)?.unit || null;
        for (const component of components) {
            if (!component.unit) component.unit = sharedUnit;
        }
    }
    return components;
}

function tokenizeIdentity(value: string) {
    return normalizeIdentityText(value)
        .replace(/[+/]/g, ' ')
        .split(' ')
        .filter(Boolean);
}

function isStrengthToken(token: string) {
    return /^\d+(?:\.\d+)?(?:mcg|mg|gm|g|ml|iu|units?|%)?$/.test(token);
}

function phoneticCodes(tokens: string[]) {
    const codes = new Set<string>();
    for (const token of tokens.filter((item) => /^[a-z]/.test(item))) {
        const [primary, secondary] = doubleMetaphone(token);
        if (primary) codes.add(primary);
        if (secondary) codes.add(secondary);
    }
    return [...codes];
}

export function parseDrugIdentity(brandName: string): ParsedDrugIdentity {
    const normalizedName = normalizeIdentityText(brandName);
    const tokens = tokenizeIdentity(brandName);
    const brandRoot = tokens.find((token) => /[a-z]/.test(token) && !FORM_TOKENS.has(token) && !isStrengthToken(token)) || '';
    const releaseTypes = tokens.filter((token) => RELEASE_TOKENS.has(token));
    const qualifiers: string[] = [];
    let brandSeen = false;
    for (let index = 0; index < tokens.length; index += 1) {
        const token = tokens[index];
        if (!brandSeen && token === brandRoot) {
            brandSeen = true;
            continue;
        }
        if (!brandSeen || FORM_TOKENS.has(token) || RELEASE_TOKENS.has(token) || PRESENTATION_TOKENS.has(token) || isStrengthToken(token)) continue;
        // "gm" is a qualifier when it follows a brand, and a unit when it follows a number.
        if (UNIT_TOKENS.has(token) && (index === 0 || /^\d/.test(tokens[index - 1]))) continue;
        qualifiers.push(token);
    }
    const strengths = parseStrengthComponents(brandName);
    const gmStrength = strengths[1]?.value;
    if (qualifiers.includes('gm') && Number.isInteger(gmStrength) && gmStrength > 0 && gmStrength < 10) {
        qualifiers.push(`gm${gmStrength}`);
    }
    const dosageForm = inferDosageForm(brandName);
    const identityTokens = [brandRoot, ...qualifiers, ...releaseTypes].filter(Boolean);
    const compactIdentity = identityTokens.join('').replace(/[^a-z0-9]/g, '');
    const compactName = `${compactIdentity}${strengths.map((component) => String(component.value)).join('')}`;
    const parseStatus = dosageForm === 'unknown'
        ? 'form_unknown'
        : strengths.some((component) => !component.unit)
            ? 'strength_unit_unknown'
            : 'complete';
    return {
        normalized_name: normalizedName,
        compact_name: compactName,
        compact_identity: compactIdentity,
        brand_root: brandRoot,
        dosage_form: dosageForm,
        release_types: [...new Set(releaseTypes)],
        qualifiers: [...new Set(qualifiers)],
        strength_components: strengths,
        phonetic_codes: phoneticCodes(identityTokens),
        parse_status: parseStatus,
    };
}

function editSimilarity(left: string, right: string) {
    const length = Math.max(left.length, right.length);
    return length === 0 ? 1 : Math.max(0, 1 - distance(left, right) / length);
}

type PreparedDistance = (value: string) => number;

// fastest-levenshtein already uses Myers for short strings. This variant keeps
// the bit masks for a repeated request string instead of rebuilding them for
// every drug in the catalogue.
export function prepareShortStringDistance(pattern: string): PreparedDistance {
    if (pattern.length === 0) return (value) => value.length;
    if (pattern.length > 32) return (value) => distance(pattern, value);

    const masks = new Uint32Array(128);
    for (let index = 0; index < pattern.length; index += 1) {
        const code = pattern.charCodeAt(index);
        if (code >= masks.length) return (value) => distance(pattern, value);
        masks[code] |= 1 << index;
    }
    const last = 1 << (pattern.length - 1);

    return (value: string) => {
        let positive = -1;
        let negative = 0;
        let score = pattern.length;
        for (let index = 0; index < value.length; index += 1) {
            let equal = masks[value.charCodeAt(index)] || 0;
            const combined = equal | negative;
            equal |= ((equal & positive) + positive) ^ positive;
            negative |= ~(equal | positive);
            positive &= equal;
            if (negative & last) score += 1;
            if (positive & last) score -= 1;
            negative = (negative << 1) | 1;
            positive = (positive << 1) | ~(combined | negative);
            negative &= combined;
        }
        return score;
    };
}

function preparedEditSimilarity(left: string, right: string, preparedDistance: PreparedDistance) {
    const length = Math.max(left.length, right.length);
    return length === 0 ? 1 : Math.max(0, 1 - preparedDistance(right) / length);
}

export function prepareDiceSimilarity(leftInput: string) {
    const left = leftInput.replace(/\s+/g, '');
    const bigrams = new Map<number, number>();
    for (let index = 0; index < left.length - 1; index += 1) {
        const key = left.charCodeAt(index) * 65536 + left.charCodeAt(index + 1);
        bigrams.set(key, (bigrams.get(key) || 0) + 1);
    }
    const entries = [...bigrams.entries()];

    return (rightInput: string) => {
        const right = rightInput.replace(/\s+/g, '');
        if (!leftInput || !rightInput) return 0;
        if (left === right) return 1;
        if (left.length < 2 || right.length < 2) return 0;
        let matches = 0;
        for (const [key, available] of entries) {
            let found = 0;
            for (let index = 0; index < right.length - 1; index += 1) {
                const rightKey = right.charCodeAt(index) * 65536 + right.charCodeAt(index + 1);
                if (rightKey === key) found += 1;
            }
            matches += Math.min(available, found);
        }
        return (2 * matches) / (left.length + right.length - 2);
    };
}

function diceSimilarity(left: string, right: string) {
    if (!left || !right) return 0;
    if (left === right) return 1;
    return compareTwoStrings(left, right);
}

// These are mathematical ceilings for the three lexical scores below.  They
// let fuzzy retrieval reject pairs that cannot reach its existing threshold
// before allocating the Levenshtein/Dice working structures.  A pair at the
// ceiling is intentionally retained, so this cannot remove an eligible seed.
function editSimilarityCeiling(left: string, right: string) {
    const longest = Math.max(left.length, right.length);
    return longest === 0 ? 1 : Math.min(left.length, right.length) / longest;
}

function diceSimilarityCeiling(left: string, right: string) {
    if (!left || !right) return 0;
    if (left === right) return 1;
    const leftBigrams = left.length - 1;
    const rightBigrams = right.length - 1;
    if (leftBigrams <= 0 || rightBigrams <= 0) return 0;
    return (2 * Math.min(leftBigrams, rightBigrams)) / (leftBigrams + rightBigrams);
}

function oneCharacterDeletions(value: string) {
    const deletions = new Set<string>();
    for (let index = 0; index < value.length; index += 1) {
        deletions.add(`${value.slice(0, index)}${value.slice(index + 1)}`);
    }
    return deletions;
}

interface CandidateSimilarity {
    rootEdit: number;
    rootDice: number;
    compactEdit: number;
}

export interface DrugMatchBatchContext {
    rootSimilarities: Map<string, Map<number, Pick<CandidateSimilarity, 'rootEdit' | 'rootDice'>>>;
}

export function createDrugMatchBatchContext(): DrugMatchBatchContext {
    return { rootSimilarities: new Map() };
}

interface FuzzySeed extends CandidateSimilarity {
    drug: IndexedDrug;
    seed: number;
    index: number;
}

function isWorseFuzzySeed(left: FuzzySeed, right: FuzzySeed) {
    return left.seed < right.seed || (left.seed === right.seed && left.index > right.index);
}

function topFuzzySeeds(
    drugs: IndexedDrug[],
    request: ParsedDrugIdentity,
    limit = 250,
    batchContext?: DrugMatchBatchContext,
) {
    // A min-heap retains the same stable top-N set as Array#sort(...).slice(0, N),
    // without sorting every same-initial drug on each medication request.
    const heap: FuzzySeed[] = [];
    const bubbleUp = (index: number) => {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (!isWorseFuzzySeed(heap[index], heap[parent])) break;
            [heap[index], heap[parent]] = [heap[parent], heap[index]];
            index = parent;
        }
    };
    const sinkDown = (index: number) => {
        while (true) {
            const left = index * 2 + 1;
            const right = left + 1;
            let worst = index;
            if (left < heap.length && isWorseFuzzySeed(heap[left], heap[worst])) worst = left;
            if (right < heap.length && isWorseFuzzySeed(heap[right], heap[worst])) worst = right;
            if (worst === index) return;
            [heap[index], heap[worst]] = [heap[worst], heap[index]];
            index = worst;
        }
    };

    const preparedRootDistance = prepareShortStringDistance(request.brand_root);
    const preparedCompactDistance = prepareShortStringDistance(request.compact_identity);
    const preparedRootDice = prepareDiceSimilarity(request.brand_root);
    let rootSimilarities = batchContext?.rootSimilarities.get(request.brand_root);
    if (batchContext && !rootSimilarities) {
        rootSimilarities = new Map();
        batchContext.rootSimilarities.set(request.brand_root, rootSimilarities);
    }

    for (let index = 0; index < drugs.length; index += 1) {
        const drug = drugs[index];
        const possibleSeed = Math.max(
            editSimilarityCeiling(request.brand_root, drug.brand_root),
            diceSimilarityCeiling(request.brand_root, drug.brand_root),
            editSimilarityCeiling(request.compact_identity, drug.compact_identity),
        );
        if (possibleSeed < 0.42) continue;
        let rootSimilarity = rootSimilarities?.get(drug.id);
        if (!rootSimilarity) {
            rootSimilarity = {
                rootEdit: preparedEditSimilarity(request.brand_root, drug.brand_root, preparedRootDistance),
                rootDice: preparedRootDice(drug.brand_root),
            };
            rootSimilarities?.set(drug.id, rootSimilarity);
        }
        const { rootEdit, rootDice } = rootSimilarity;
        const compactEdit = preparedEditSimilarity(request.compact_identity, drug.compact_identity, preparedCompactDistance);
        const seed = Math.max(rootEdit, rootDice, compactEdit);
        if (seed < 0.42) continue;
        const item = { drug, seed, index, rootEdit, rootDice, compactEdit };
        if (heap.length < limit) {
            heap.push(item);
            bubbleUp(heap.length - 1);
        } else if (isWorseFuzzySeed(heap[0], item)) {
            heap[0] = item;
            sinkDown(0);
        }
    }
    return heap.sort((left, right) => right.seed - left.seed || left.index - right.index);
}

function comparableStrength(component: StrengthComponent) {
    if (component.unit === 'g') return { value: component.value * 1000, unit: 'mg' };
    if (component.unit === 'mcg') return { value: component.value / 1000, unit: 'mg' };
    return { value: component.value, unit: component.unit };
}

type StrengthComparison = 'not_requested' | 'exact' | 'partial' | 'unknown' | 'conflict';

export function compareStrengthComponents(requested: StrengthComponent[], candidate: StrengthComponent[]): StrengthComparison {
    if (!requested.length) return 'not_requested';
    if (!candidate.length) return 'unknown';
    const count = Math.min(requested.length, candidate.length);
    for (let index = 0; index < count; index += 1) {
        const left = comparableStrength(requested[index]);
        const right = comparableStrength(candidate[index]);
        if (Math.abs(left.value - right.value) > 0.011) return 'conflict';
        if (left.unit && right.unit && left.unit !== right.unit) return 'conflict';
    }
    if (requested.length === candidate.length) return 'exact';
    return 'partial';
}

export function requestedIdentity(request: MatchRequest): ParsedDrugIdentity {
    const parsed = parseDrugIdentity(request.spoken_name);
    const explicitForm = request.dosage_form && !/^(?:n\/?a|unknown)$/i.test(request.dosage_form.trim())
        ? request.dosage_form
        : '';
    const requestedForm = normalizeRequestedForm(explicitForm || request.source_text || request.route || '');
    const explicitStrengths = request.strength_components?.length
        ? request.strength_components
        : parseStrengthComponents(`${request.strength || ''}`);
    const explicitQualifiers = request.qualifiers?.length
        ? request.qualifiers.map((token) => normalizeIdentityText(token).replace(/\s+/g, ''))
        : parsed.qualifiers;
    const explicitRelease = Array.isArray(request.release_type)
        ? request.release_type
        : request.release_type ? [request.release_type] : parsed.release_types;
    return {
        ...parsed,
        dosage_form: requestedForm,
        qualifiers: [...new Set(explicitQualifiers.filter(Boolean))],
        release_types: [...new Set(explicitRelease.map((token) => normalizeIdentityText(token)).filter(Boolean))],
        strength_components: explicitStrengths,
        compact_name: `${parsed.compact_identity}${explicitStrengths.map((component) => String(component.value)).join('')}`,
    };
}

function formCompatibility(requested: DosageForm, candidate: DosageForm) {
    if (requested === 'unknown') return 'not_requested' as const;
    if (candidate === 'unknown') return 'unknown' as const;
    if (requested === candidate) return 'exact' as const;
    return 'conflict' as const;
}

function rankCandidate(
    request: ParsedDrugIdentity,
    candidate: IndexedDrug,
    aliasMatch = false,
    effervescentHint = false,
    precomputedSimilarity?: CandidateSimilarity,
): RankedDrugCandidate | null {
    const rootEdit = precomputedSimilarity?.rootEdit ?? editSimilarity(request.brand_root, candidate.brand_root);
    const rootDice = precomputedSimilarity?.rootDice ?? diceSimilarity(request.brand_root, candidate.brand_root);
    const compactEdit = precomputedSimilarity?.compactEdit ?? editSimilarity(request.compact_identity, candidate.compact_identity);
    const lexical = Math.max(rootEdit, rootDice, compactEdit);
    const requestedPrimary = request.phonetic_codes[0] || '';
    const phoneticDistances = candidate.phonetic_codes.map((code) => requestedPrimary && code ? distance(requestedPrimary, code) : 99);
    const bestPhoneticDistance = phoneticDistances.length ? Math.min(...phoneticDistances) : 99;
    const exactRoot = request.brand_root === candidate.brand_root;
    const exactCompact = request.compact_name === candidate.compact_name || request.compact_identity === candidate.compact_identity;
    if (!exactRoot && !exactCompact && lexical < 0.42 && bestPhoneticDistance > 1) return null;

    const requestedQualifiers = request.qualifiers;
    const missingQualifiers = requestedQualifiers.filter((token) => !candidate.qualifiers.includes(token));
    const extraQualifiers = candidate.qualifiers.filter((token) => {
        if (requestedQualifiers.includes(token)) return false;
        if (token === 'gm' && requestedQualifiers.some((requested) => /^gm\d+$/.test(requested))) return false;
        return true;
    });
    const missingRelease = request.release_types.filter((token) => !candidate.release_types.includes(token));
    const extraRelease = candidate.release_types.filter((token) => !request.release_types.includes(token));
    const strength = compareStrengthComponents(request.strength_components, candidate.strength_components);
    const form = formCompatibility(request.dosage_form, candidate.dosage_form);
    const evidence: string[] = [];
    const conflicts: string[] = [];
    const reviewReasons: string[] = [];

    let score = rootEdit * 30 + rootDice * 20 + compactEdit * 15;
    if (exactRoot) {
        score += 5;
        evidence.push('exact brand root');
    }
    if (exactCompact) {
        score += 5;
        evidence.push('exact compact identity');
    }
    if (bestPhoneticDistance === 0) {
        score += 3;
        evidence.push('exact phonetic code');
    } else if (bestPhoneticDistance === 1) {
        score += 1;
        evidence.push('near phonetic code');
    }
    if (aliasMatch) {
        score += 15;
        evidence.push('verified alias');
    }

    if (form === 'exact') {
        score += 5;
        evidence.push(`form ${candidate.dosage_form}`);
    } else if (form === 'conflict') {
        score -= 50;
        conflicts.push(`requested ${request.dosage_form}; candidate ${candidate.dosage_form}`);
    } else if (form === 'unknown') {
        score -= 5;
        reviewReasons.push('candidate dosage form is unknown');
    }

    const isExactMatch = exactRoot && exactCompact;

    if (requestedQualifiers.length && missingQualifiers.length === 0) {
        score += 7;
        evidence.push(`qualifiers ${requestedQualifiers.join('/')}`);
    } else if (missingQualifiers.length) {
        if (!isExactMatch) {
            score -= 30;
            conflicts.push(`missing qualifier ${missingQualifiers.join('/')}`);
        } else {
            evidence.push(`ignored missing qualifier due to exact match`);
        }
    }
    if (extraQualifiers.length) {
        if (!isExactMatch) {
            score -= Math.min(12, extraQualifiers.length * 4);
            reviewReasons.push(`extra qualifier ${extraQualifiers.join('/')}`);
        }
    }

    if (request.release_types.length && missingRelease.length === 0) {
        score += 5;
        evidence.push(`release ${request.release_types.join('/')}`);
    } else if (missingRelease.length) {
        if (!isExactMatch) {
            score -= 30;
            conflicts.push(`release mismatch ${missingRelease.join('/')}`);
        } else {
            evidence.push(`ignored release mismatch due to exact match`);
        }
    }
    if (extraRelease.length) {
        if (!isExactMatch) {
            score -= Math.min(10, extraRelease.length * 5);
            reviewReasons.push(`unspoken release ${extraRelease.join('/')}`);
        }
    }

    if (strength === 'exact') {
        score += 10;
        evidence.push('complete visible strength');
    } else if (strength === 'partial') {
        score += 1;
        reviewReasons.push('database name exposes only part of the spoken strength');
    } else if (strength === 'unknown') {
        score -= 5;
        reviewReasons.push('candidate strength is unknown');
    } else if (strength === 'conflict') {
        score -= 40;
        conflicts.push('strength conflict');
    }
    if (strength === 'not_requested' && candidate.strength_components.length) {
        score -= 6;
        reviewReasons.push('candidate has a strength that was not spoken');
    }
    if (request.dosage_form !== 'unknown' && candidate.normalized_name.includes(request.dosage_form)) {
        score += 2;
    }
    if (effervescentHint) {
        if (candidate.normalized_name.includes('effervescent')) {
            score += 12;
            evidence.push('effervescent administration instruction');
        } else {
            score -= 5;
        }
    }

    score = Math.max(0, Math.min(100, score));
    const compatible = conflicts.length === 0;
    let matchType: RankedDrugCandidate['match_type'] = 'Fuzzy';
    if (aliasMatch) matchType = 'Alias';
    else if (exactRoot && exactCompact) matchType = 'Exact';
    else if (exactCompact) matchType = 'Compact';
    else if (bestPhoneticDistance === 0) matchType = 'Phonetic';
    else if (bestPhoneticDistance === 1) matchType = 'Near-Phonetic';
    return {
        id: candidate.id,
        brand_name: candidate.brand_name,
        salt: candidate.salt,
        score: Number(score.toFixed(2)),
        confidence: Number((score / 100).toFixed(3)),
        match_type: matchType,
        phonetic_code: candidate.phonetic_codes[0] || '',
        dosage_form: candidate.dosage_form,
        qualifiers: candidate.qualifiers,
        release_types: candidate.release_types,
        strength_components: candidate.strength_components,
        compatible,
        auto_selectable: false,
        evidence,
        conflicts,
        review_reasons: reviewReasons,
    };
}

export function buildDrugMatchIndex(list: IndexedDrug[]): DrugMatchIndex {
    const byBrandRoot = new Map<string, IndexedDrug[]>();
    const byCompactName = new Map<string, IndexedDrug[]>();
    const byCompactIdentity = new Map<string, IndexedDrug[]>();
    const byInitial = new Map<string, IndexedDrug[]>();
    const byPhonetic = new Map<string, IndexedDrug[]>();
    const aliasesByNormalized = new Map<string, IndexedDrug>();
    const aliasesByCompact = new Map<string, IndexedDrug>();
    const phoneticKeysByDeletion = new Map<string, string[]>();
    const append = (map: Map<string, IndexedDrug[]>, key: string, drug: IndexedDrug) => {
        if (!key) return;
        const existing = map.get(key);
        if (existing) existing.push(drug);
        else map.set(key, [drug]);
    };
    for (const drug of list) {
        append(byBrandRoot, drug.brand_root, drug);
        append(byCompactName, drug.compact_name, drug);
        append(byCompactIdentity, drug.compact_identity, drug);
        append(byInitial, drug.brand_root[0] || '', drug);
        for (const code of drug.phonetic_codes) append(byPhonetic, code, drug);
    }
    const phoneticKeys = [...byPhonetic.keys()];
    for (const key of phoneticKeys) {
        for (const deletion of oneCharacterDeletions(key)) {
            const keys = phoneticKeysByDeletion.get(deletion);
            if (keys) keys.push(key);
            else phoneticKeysByDeletion.set(deletion, [key]);
        }
    }
    return {
        list,
        byBrandRoot,
        byCompactName,
        byCompactIdentity,
        byInitial,
        byPhonetic,
        aliasesByNormalized,
        aliasesByCompact,
        phoneticKeys,
        phoneticKeysByDeletion,
    };
}

export function nearPhoneticKeys(index: DrugMatchIndex, code: string) {
    const matches = new Set<string>();
    if (index.byPhonetic.has(code)) matches.add(code);

    // A shorter candidate is an exact deletion of the query. A longer candidate
    // deletes to the query. Equal-length substitutions share one deletion.
    for (const deletion of oneCharacterDeletions(code)) {
        if (index.byPhonetic.has(deletion)) matches.add(deletion);
        for (const key of index.phoneticKeysByDeletion.get(deletion) || []) matches.add(key);
    }
    for (const key of index.phoneticKeysByDeletion.get(code) || []) matches.add(key);

    // Shared deletion keys can include a transposition (edit distance two), so
    // retain the exact predicate used by the previous full scan.
    return [...matches].filter((key) => Math.abs(key.length - code.length) <= 1 && distance(key, code) <= 1);
}

export function rankDrugCandidates(
    index: DrugMatchIndex,
    requestInput: MatchRequest,
    limit = 12,
    batchContext?: DrugMatchBatchContext,
    supplemental?: { drugs: IndexedDrug[]; aliasDrugIds: number[] },
) {
    const request = requestedIdentity(requestInput);
    const pool = new Map<number, IndexedDrug>();
    const aliasDrugIds = new Set<number>(supplemental?.aliasDrugIds || []);
    const addAll = (drugs: IndexedDrug[] | undefined) => drugs?.forEach((drug) => pool.set(drug.id, drug));
    addAll(index.byBrandRoot.get(request.brand_root));
    addAll(index.byCompactName.get(request.compact_name));
    addAll(index.byCompactIdentity.get(request.compact_identity));
    const normalizedAlias = index.aliasesByNormalized.get(request.normalized_name);
    const compactAlias = index.aliasesByCompact.get(request.compact_identity);
    for (const aliasDrug of [normalizedAlias, compactAlias]) {
        if (!aliasDrug) continue;
        pool.set(aliasDrug.id, aliasDrug);
        aliasDrugIds.add(aliasDrug.id);
    }
    for (const code of request.phonetic_codes) {
        for (const key of nearPhoneticKeys(index, code)) addAll(index.byPhonetic.get(key));
    }
    addAll(supplemental?.drugs);

    // Fuzzy retrieval is deliberately broader than the final result set.
    const sameInitial = index.byInitial.get(request.brand_root[0] || '') || [];
    const fuzzySeed = topFuzzySeeds(sameInitial, request, 250, batchContext);
    fuzzySeed.forEach(({ drug }) => pool.set(drug.id, drug));
    const fuzzySimilarities = new Map(fuzzySeed.map((seed) => [seed.drug.id, seed]));

    const effervescentHint = /\b(?:half|one[- ]?half|full)\s+glass\b|\bdissolv|\beffervesc|\bglass of water\b/i
        .test(`${requestInput.instructions || ''} ${requestInput.source_text || ''}`);
    const ranked = [...pool.values()]
        .map((drug) => rankCandidate(request, drug, aliasDrugIds.has(drug.id), effervescentHint, fuzzySimilarities.get(drug.id)))
        .filter((candidate): candidate is RankedDrugCandidate => Boolean(candidate))
        .sort((left, right) => {
            if (left.compatible !== right.compatible) return left.compatible ? -1 : 1;
            return right.score - left.score || left.brand_name.localeCompare(right.brand_name);
        });
    const unique = [...new Map(ranked.map((candidate) => [candidate.brand_name.toLowerCase(), candidate])).values()];
    const compatible = unique.filter((candidate) => candidate.compatible);
    const top = compatible[0] || null;
    const runnerUp = compatible[1] || null;
    if (top) {
        const margin = runnerUp ? top.score - runnerUp.score : top.score;
        const exactIdentity = top.match_type === 'Exact' && top.evidence.includes('complete visible strength');
        top.auto_selectable = top.score >= 85
            && (margin >= 5 || exactIdentity)
            && top.review_reasons.length === 0;
    }
    const selectionStatus = top?.auto_selectable
        ? 'matched'
        : top && top.score >= 65
            ? 'needs_review'
            : 'no_match';
    return {
        request,
        candidates: unique.slice(0, limit),
        recommended_candidate: top?.auto_selectable ? top : null,
        review_candidate: top,
        selection_status: selectionStatus,
        score_margin: top && runnerUp ? Number((top.score - runnerUp.score).toFixed(2)) : null,
    };
}
