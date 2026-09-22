import { parentPort } from 'worker_threads';
import {
    buildDrugMatchIndex,
    createDrugMatchBatchContext,
    IndexedDrug,
    MatchRequest,
    rankDrugCandidates,
} from './drug-matching.service';

type WorkerMessage =
    | { id: number; type: 'initialize'; list: IndexedDrug[] }
    | {
        id: number;
        type: 'match';
        tasks: Array<{
            request: MatchRequest;
            supplemental: { drugs: IndexedDrug[]; aliasDrugIds: number[] };
        }>;
        limit: number;
    };

let index: ReturnType<typeof buildDrugMatchIndex> | null = null;

parentPort?.on('message', (message: WorkerMessage) => {
    try {
        if (message.type === 'initialize') {
            index = buildDrugMatchIndex(message.list);
            parentPort?.postMessage({ id: message.id, result: true });
            return;
        }

        if (!index) throw new Error('Drug matching worker is not initialized');
        const batchContext = createDrugMatchBatchContext();
        const result = message.tasks.map(({ request, supplemental }) =>
            rankDrugCandidates(index!, request, message.limit, batchContext, supplemental));
        parentPort?.postMessage({ id: message.id, result });
    } catch (error) {
        parentPort?.postMessage({
            id: message.id,
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
