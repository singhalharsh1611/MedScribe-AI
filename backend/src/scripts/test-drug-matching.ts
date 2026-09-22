import assert from 'node:assert/strict';
import { distance } from 'fastest-levenshtein';
import { compareTwoStrings } from 'string-similarity';
import {
    buildDrugMatchIndex,
    createDrugMatchBatchContext,
    IndexedDrug,
    nearPhoneticKeys,
    parseDrugIdentity,
    prepareDiceSimilarity,
    prepareShortStringDistance,
    rankDrugCandidates,
} from '../services/drug-matching.service';
import { validateMedicationSelections } from '../services/prescription.service';

function fixture(id: number, brandName: string): IndexedDrug {
    return { id, brand_name: brandName, salt: '', ...parseDrugIdentity(brandName) };
}

const clavu = parseDrugIdentity('Clavu M 625 Tablet');
assert.equal(clavu.brand_root, 'clavu');
assert.equal(clavu.compact_name, 'clavum625');
assert.deepEqual(clavu.qualifiers, ['m']);
assert.equal(clavu.dosage_form, 'tablet');
assert.deepEqual(clavu.strength_components.map(({ value }) => value), [625]);

const combination = parseDrugIdentity('Sitaglo Gm 50mg 2mg 1000mg Tablet');
assert.deepEqual(combination.qualifiers, ['gm', 'gm2']);
assert.deepEqual(combination.strength_components.map(({ value, unit }) => [value, unit]), [[50, 'mg'], [2, 'mg'], [1000, 'mg']]);
assert.equal(parseDrugIdentity('3a Pan 40mg Tablet').brand_root, '3a');
assert.deepEqual(parseDrugIdentity('Glycomet Gp 2 Tablet Pr').strength_components, []);

const index = buildDrugMatchIndex([
    fixture(1, 'Pan 40 Tablet'),
    fixture(2, 'Pan 40 Capsule'),
    fixture(3, 'Pan Dear 40mg Tablet'),
    fixture(4, 'Glycomet Gp 1 Tablet Pr'),
    fixture(5, 'Glycomet Gp 2 Tablet Pr'),
    fixture(6, 'Foracort 200 Inhaler'),
    fixture(7, 'Foracort 200 Rotacap'),
    fixture(8, 'Mero O 300mg Tablet Er'),
    fixture(9, 'Tazloc 40 Tablet'),
]);

const similarityPairs = [
    ['', ''],
    ['pan', 'pan'],
    ['glycomet', 'glykomet'],
    ['tazlocct', 'tazlokct'],
    ['triolmesar', 'triolmas'],
    ['a'.repeat(32), 'a'.repeat(31) + 'b'],
    ['a'.repeat(33), 'a'.repeat(32) + 'b'],
];
for (const [left, right] of similarityPairs) {
    assert.equal(prepareShortStringDistance(left)(right), distance(left, right));
    const expectedDice = !left || !right ? 0 : left === right ? 1 : compareTwoStrings(left, right);
    assert.equal(prepareDiceSimilarity(left)(right), expectedDice);
}

const relatedRequests = ['Glycomet', 'Glycomet GP1', 'Glycomet GP2'].map((spoken_name) => ({ spoken_name }));
const independentResults = relatedRequests.map((request) => rankDrugCandidates(index, request));
const batchContext = createDrugMatchBatchContext();
const reusedResults = relatedRequests.map((request) => rankDrugCandidates(index, request, 12, batchContext));
assert.deepEqual(reusedResults, independentResults);

for (const code of index.phoneticKeys) {
    const expected = index.phoneticKeys
        .filter((key) => Math.abs(key.length - code.length) <= 1 && distance(key, code) <= 1)
        .sort();
    assert.deepEqual(nearPhoneticKeys(index, code).sort(), expected);
}

const pan = rankDrugCandidates(index, {
    spoken_name: 'Pan',
    strength: '40 mg',
    dosage_form: 'tablet',
});
assert.equal(pan.candidates[0].brand_name, 'Pan 40 Tablet');
assert.equal(pan.candidates.find((candidate) => candidate.id === 2)?.compatible, false);

const sourceForm = rankDrugCandidates(index, {
    spoken_name: 'Pan',
    strength: '40 mg',
    dosage_form: 'N/A',
    source_text: 'capsule Pan 40 mg',
});
assert.equal(sourceForm.candidates[0].brand_name, 'Pan 40 Capsule');

const gp1 = rankDrugCandidates(index, {
    spoken_name: 'Glycomet GP1',
    dosage_form: 'tablet',
    qualifiers: ['GP1'],
});
assert.equal(gp1.candidates[0].brand_name, 'Glycomet Gp 1 Tablet Pr');
assert.equal(gp1.candidates.find((candidate) => candidate.id === 5)?.compatible, false);

const inhaler = rankDrugCandidates(index, {
    spoken_name: 'Foracort',
    strength: '200',
    dosage_form: 'inhaler',
});
assert.equal(inhaler.candidates[0].brand_name, 'Foracort 200 Inhaler');
assert.equal(inhaler.candidates.find((candidate) => candidate.id === 7)?.compatible, false);

const mero = rankDrugCandidates(index, {
    spoken_name: 'Mero',
    strength: '30 mg',
    dosage_form: 'tablet',
});
assert.equal(mero.selection_status, 'no_match');
assert.equal(mero.recommended_candidate, null);

const tezloc = rankDrugCandidates(index, {
    spoken_name: 'Tezloc',
    strength: '40',
    dosage_form: 'tablet',
});
assert.equal(tezloc.candidates[0].brand_name, 'Tazloc 40 Tablet');

const commonMappedFields = {
    spoken_name: 'Test medicine',
    selection_status: 'needs_review',
    dose: 'N/A',
    route: 'oral',
    frequency: 'N/A',
    duration: 'N/A',
    instructions: 'N/A',
    recommended_candidate: null,
    review_candidate: null,
};
const candidate = (id: number, brandName: string, score: number, matchType: string) => ({
    id,
    brand_name: brandName,
    score,
    confidence: score / 100,
    match_type: matchType,
    dosage_form: 'tablet',
    compatible: true,
    auto_selectable: false,
    conflicts: [],
    evidence: [],
});

const closeDrotinChoice = validateMedicationSelections({
    medications: [{ selected_candidate_id: 102, selection_reason: 'Preserves the heard Drotin MF brand tokens.' }],
}, [{
    ...commonMappedFields,
    spoken_name: 'Drotin MF',
    candidates: [
        candidate(101, 'Drotik Mf Tablet', 69.13, 'Fuzzy'),
        candidate(102, 'Drotine Mf 80mg 250mg Tablet', 68.23, 'Fuzzy'),
    ],
}]);
assert.equal(closeDrotinChoice.medications[0].medicine, 'Drotine Mf 80mg 250mg Tablet');

const protectedTriolmesarChoice = validateMedicationSelections({
    medications: [{ selected_candidate_id: 202, selection_reason: 'AI selected a shorter spelling.' }],
}, [{
    ...commonMappedFields,
    spoken_name: 'Triolmesar',
    candidates: [
        candidate(201, 'Triolmesar 40 Tablet', 86, 'Exact'),
        candidate(202, 'Triolmas 40 Tablet', 70, 'Fuzzy'),
    ],
}]);
assert.equal(protectedTriolmesarChoice.medications[0].medicine, 'Triolmesar 40 Tablet');
assert.match(protectedTriolmesarChoice.medications[0].selection_reason, /Backend retained/);

console.log('Drug matching regression tests passed.');
