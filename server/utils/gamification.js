const User = require('../models/User');
const Transaction = require('../models/Transaction');

const BADGES = {
    TRACKER_NOVICE: { id: 'TRACKER_NOVICE', name: 'Tracker Novice', description: 'First transaction added', icon: '🌱' },
    CONSISTENCY_KING: { id: 'CONSISTENCY_KING', name: 'Consistency King', description: '7 days streak', icon: '🔥' },
    DEBT_DESTROYER: { id: 'DEBT_DESTROYER', name: 'Debt Destroyer', description: 'Pay off a fixed debt', icon: '🛡️' }
};

const checkAchievements = async (userId, actionType, context = {}) => {
    try {
        const user = await User.findById(userId);
        if (!user) return { newBadges: [], xpGained: 0 };

        let newBadges = [];
        let xpGained = 0;
        let updated = false;

        // 1. XP Logic
        if (actionType === 'ADD_TRANSACTION') {
            xpGained += 10;
            updated = true;
        } else if (actionType === 'PAY_DEBT') {
            xpGained += 50;
            updated = true;
        }

        user.xp = (user.xp || 0) + xpGained;

        // 2. Badge: Tracker Novice
        const hasNovice = user.badges && user.badges.some(b => b.id === BADGES.TRACKER_NOVICE.id);
        if (!hasNovice && actionType === 'ADD_TRANSACTION') {
            const count = await Transaction.countDocuments({ userId });
            if (count >= 1) { // Current one is already created usually or about to be
                newBadges.push(BADGES.TRACKER_NOVICE);
                user.badges.push({ id: BADGES.TRACKER_NOVICE.id });
                xpGained += 50; // Bonus
                user.xp += 50;
                updated = true;
            }
        }

        // 3. Badge: Consistency King
        if (actionType === 'ADD_TRANSACTION') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const lastLog = user.lastLogDate ? new Date(user.lastLogDate) : null;
            if (lastLog) lastLog.setHours(0, 0, 0, 0);

            if (!lastLog || lastLog.getTime() < today.getTime()) {
                // It's a new day
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                if (lastLog && lastLog.getTime() === yesterday.getTime()) {
                    // Consecutive day
                    user.streak = (user.streak || 0) + 1;
                } else {
                    // Broken streak or first time
                    user.streak = 1;
                }
                user.lastLogDate = new Date();
                updated = true;

                // Check badge
                const hasConsistency = user.badges && user.badges.some(b => b.id === BADGES.CONSISTENCY_KING.id);
                if (!hasConsistency && user.streak >= 7) {
                    newBadges.push(BADGES.CONSISTENCY_KING);
                    user.badges.push({ id: BADGES.CONSISTENCY_KING.id });
                    xpGained += 100;
                    user.xp += 100;
                }
            }
        }

        // 4. Badge: Debt Destroyer
        if (actionType === 'PAY_DEBT') {
            const hasDebtBadge = user.badges && user.badges.some(b => b.id === BADGES.DEBT_DESTROYER.id);
            // Context should tell us if debt was fully paid
            if (!hasDebtBadge && context.debtPaid) {
                newBadges.push(BADGES.DEBT_DESTROYER);
                user.badges.push({ id: BADGES.DEBT_DESTROYER.id });
                xpGained += 200;
                user.xp += 200;
                updated = true;
            }
        }

        if (updated) {
            await user.save();
        }

        return { newBadges, xpGained, currentXp: user.xp, streak: user.streak };
    } catch (error) {
        console.error('Gamification Error:', error);
        return { newBadges: [], xpGained: 0 };
    }
};

module.exports = { checkAchievements, BADGES };
