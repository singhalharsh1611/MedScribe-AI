import { existsSync } from 'fs';
import { availableParallelism } from 'os';
import path from 'path';
import { Worker } from 'worker_threads';
import {
    createDrugMatchBatchContext,
    DrugMatchIndex,
    IndexedDrug,
    MatchRequest,
    nearPhoneticKeys,
    RankedDrugCandidate,
    rankDrugCandidates,
    requestedIdentity,
} from './drug-matching.service';

interface LightweightTask {
    request: MatchRequest;
    supplementalDrugIds: number[];
    aliasDrugIds: number[];
}

interface PendingRequest {
    resolve: (value: any) => void;
    reject: (reason: Error) => void;
}

// Result caching to ensure repeat prescriptions match instantly
interface CachedResult {
    result: any;
    timestamp: number;
}

class DrugMatchingPool {
    private workers: Worker[] = [];
    private lanes: Array<Promise<void>> = [];
    private pending = new Map<number, PendingRequest>();
    private nextRequestId = 1;
    private fallbackIndex: DrugMatchIndex | null = null;
    private ownerByInitial = new Map<string, number>();
    private drugsById = new Map<number, IndexedDrug>();
    
    // LRU Cache for exact MatchRequest inputs
    private resultCache = new Map<string, CachedResult>();
    private readonly MAX_CACHE_SIZE = 10000;

    private getCacheKey(req: MatchRequest): string {
        const q = Array.isArray(req.qualifiers) ? req.qualifiers.join(',') : (req.qualifiers || '');
        const r = Array.isArray(req.release_type) ? req.release_type.join(',') : (req.release_type || '');
        return `${req.spoken_name}|${req.dosage_form || ''}|${req.strength || ''}|${q}|${r}`;
    }

    async initialize(index: DrugMatchIndex) {
        this.fallbackIndex = index;
        if (this.workers.length) return;

        for (const drug of index.list) this.drugsById.set(drug.id, drug);

        const configured = Number(process.env.DRUG_MATCH_WORKERS || '');
        const cpuBound = Math.max(1, availableParallelism());
        const workerCount = Number.isFinite(configured) && configured > 0
            ? Math.min(8, Math.floor(configured))
            : Math.min(8, cpuBound);
        const compiledWorker = path.join(__dirname, 'drug-matching.worker.js');
        const workerFile = existsSync(compiledWorker)
            ? compiledWorker
            : path.join(__dirname, 'drug-matching.worker.ts');
        const workerOptions = workerFile.endsWith('.ts')
            ? { execArgv: ['-r', require.resolve('ts-node/register/transpile-only')] }
            : undefined;
        const shards: IndexedDrug[][] = Array.from({ length: workerCount }, () => []);
        const shardSizes = Array.from({ length: workerCount }, () => 0);
        const shardInitials: string[][] = Array.from({ length: workerCount }, () => []);
        const initialBuckets = [...index.byInitial.entries()]
            .sort((left, right) => right[1].length - left[1].length);
        for (const [initial, drugs] of initialBuckets) {
            let owner = 0;
            for (let workerIndex = 1; workerIndex < workerCount; workerIndex += 1) {
                if (shardSizes[workerIndex] < shardSizes[owner]) owner = workerIndex;
            }
            this.ownerByInitial.set(initial, owner);
            shardInitials[owner].push(initial || '#');
            for (const drug of drugs) shards[owner].push(drug);
            shardSizes[owner] += drugs.length;
        }

        try {
            this.workers = Array.from({ length: workerCount }, () => {
                const worker = new Worker(workerFile, workerOptions);
                worker.on('message', (message: { id: number; result?: any; error?: string }) => {
                    const pending = this.pending.get(message.id);
                    if (!pending) return;
                    this.pending.delete(message.id);
                    if (message.error) pending.reject(new Error(message.error));
                    else pending.resolve(message.result);
                });
                worker.on('error', (error) => {
                    console.error('[Drug Matching] Worker error:', error);
                });
                return worker;
            });
            this.lanes = this.workers.map(() => Promise.resolve());
            for (let workerIndex = 0; workerIndex < this.workers.length; workerIndex += 1) {
                await this.send(this.workers[workerIndex], { type: 'initialize', list: shards[workerIndex] });
            }
            console.log(`[Drug Matching] Ready: ${this.workers.length} bounded sharded worker(s).`);
            shards.forEach((shard, workerIndex) => {
                console.log(`[Drug Matching] Worker ${workerIndex + 1}: ${shard.length} rows; initials ${shardInitials[workerIndex].sort().join(', ')}`);
            });
        } catch (error) {
            await Promise.allSettled(this.workers.map((worker) => worker.terminate()));
            this.workers = [];
            this.lanes = [];
            console.warn('[Drug Matching] Worker pool unavailable; using exact single-thread fallback:', error);
        }
    }

    async match(requests: MatchRequest[], limit = 12) {
        if (!requests.length) return [];
        
        const output = new Array(requests.length);
        const uncachedIndices: number[] = [];
        const uncachedRequests: MatchRequest[] = [];

        // 1. Check cache first
        requests.forEach((req, i) => {
            const key = this.getCacheKey(req);
            const cached = this.resultCache.get(key);
            if (cached) {
                cached.timestamp = Date.now();
                output[i] = cached.result;
            } else {
                uncachedIndices.push(i);
                uncachedRequests.push(req);
            }
        });

        if (uncachedRequests.length === 0) {
            return output;
        }

        // 2. Process uncached requests
        if (!this.workers.length) {
            if (!this.fallbackIndex) throw new Error('Drug matching catalog is not initialized');
            const context = createDrugMatchBatchContext();
            const results = uncachedRequests.map((request) => rankDrugCandidates(this.fallbackIndex!, request, limit, context));
            results.forEach((res, i) => {
                const req = uncachedRequests[i];
                const key = this.getCacheKey(req);
                this.cacheResult(key, res);
                output[uncachedIndices[i]] = res;
            });
            return output;
        }

        const assignments: Array<Array<{ outputIndex: number; task: LightweightTask }>> =
            this.workers.map(() => []);
            
        uncachedRequests.forEach((request, idx) => {
            const outputIndex = uncachedIndices[idx];
            const parsed = requestedIdentity(request);
            const workerIndex = this.ownerByInitial.get(parsed.brand_root[0] || '') ?? 0;
            const drugIds = new Set<number>();
            const aliasDrugIds = new Set<number>();
            const collectIds = (matches: IndexedDrug[] | undefined) =>
                matches?.forEach((drug) => drugIds.add(drug.id));

            collectIds(this.fallbackIndex!.byBrandRoot.get(parsed.brand_root));
            collectIds(this.fallbackIndex!.byCompactName.get(parsed.compact_name));
            collectIds(this.fallbackIndex!.byCompactIdentity.get(parsed.compact_identity));
            for (const aliasDrug of [
                this.fallbackIndex!.aliasesByNormalized.get(parsed.normalized_name),
                this.fallbackIndex!.aliasesByCompact.get(parsed.compact_identity),
            ]) {
                if (!aliasDrug) continue;
                drugIds.add(aliasDrug.id);
                aliasDrugIds.add(aliasDrug.id);
            }
            // Only resolve phonetic codes if no direct matches found to limit expansion size
            // This is a safe optimization because if we have direct/alias matches, 
            // they are almost always better than phonetic fuzzy matches
            if (drugIds.size < limit) {
                for (const code of parsed.phonetic_codes) {
                    for (const key of nearPhoneticKeys(this.fallbackIndex!, code)) {
                        const hits = this.fallbackIndex!.byPhonetic.get(key);
                        if (hits) {
                            for (const drug of hits) {
                                if (drugIds.size >= 250) break;
                                drugIds.add(drug.id);
                            }
                        }
                        if (drugIds.size >= 250) break;
                    }
                    if (drugIds.size >= 250) break;
                }
            }
            
            assignments[workerIndex].push({
                outputIndex,
                task: {
                    request,
                    supplementalDrugIds: [...drugIds],
                    aliasDrugIds: [...aliasDrugIds],
                },
            });
        });

        const chunks = this.workers.map((worker, workerIndex) => {
            const assigned = assignments[workerIndex];
            if (!assigned.length) return Promise.resolve();

            const tasksForWorker = assigned.map(({ task }) => {
                const drugs: IndexedDrug[] = [];
                for (const id of task.supplementalDrugIds) {
                    const drug = this.drugsById.get(id);
                    if (drug) drugs.push(drug);
                }
                return {
                    request: task.request,
                    supplemental: { drugs, aliasDrugIds: task.aliasDrugIds },
                };
            });

            const run = this.lanes[workerIndex].then(() =>
                this.send(worker, { type: 'match', tasks: tasksForWorker, limit }));
            this.lanes[workerIndex] = run.then(() => undefined, () => undefined);
            return run.then((results) => {
                assigned.forEach(({ outputIndex, task }, resultIndex) => {
                    const res = results[resultIndex];
                    output[outputIndex] = res;
                    this.cacheResult(this.getCacheKey(task.request), res);
                });
            });
        });
        await Promise.all(chunks);
        return output;
    }
    
    private cacheResult(key: string, result: any) {
        this.resultCache.set(key, { result, timestamp: Date.now() });
        if (this.resultCache.size > this.MAX_CACHE_SIZE) {
            // Evict oldest 10%
            const entries = [...this.resultCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
            for (let i = 0; i < this.MAX_CACHE_SIZE * 0.1; i++) {
                this.resultCache.delete(entries[i][0]);
            }
        }
    }

    private send(worker: Worker, payload: Record<string, unknown>) {
        const id = this.nextRequestId++;
        return new Promise<any>((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            worker.postMessage({ id, ...payload });
        });
    }
}

export const drugMatchingPool = new DrugMatchingPool();
