import { CivicRank } from '../types';
import { Icons } from '../constants';

const ranks: CivicRank[] = [
    { name: 'Newcomer', minScore: 0, icon: Icons.User },
    { name: 'Community Voice', minScore: 50, icon: Icons.ChatBubbleOvalLeftEllipsis },
    { name: 'Active Citizen', minScore: 150, icon: Icons.UserGroup },
    { name: 'Local Champion', minScore: 400, icon: Icons.Award },
    { name: 'Pillar of the Community', minScore: 1000, icon: Icons.Landmark }
];

export const getCivicRank = (score: number): CivicRank => {
    let currentRank = ranks[0];
    for (const rank of ranks) {
        if (score >= rank.minScore) {
            currentRank = rank;
        } else {
            break;
        }
    }
    return currentRank;
};
