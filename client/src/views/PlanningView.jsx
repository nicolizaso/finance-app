import WishlistCard from '../components/WishlistCard';
import SubscriptionWidget from '../components/SubscriptionWidget';
import { useOutletContext } from 'react-router-dom';

const PlanningView = () => {
    const { transactions, onRefresh, isPrivacyMode } = useOutletContext();

    return (
        <div className="space-y-6 pb-24 md:pb-6">
            <h3 className="text-xl font-bold text-white font-heading">Planificación</h3>
            {/* Top Row: Wishlist & Subscriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WishlistCard refreshTrigger={transactions} />
                <SubscriptionWidget />
            </div>
        </div>
    );
};

export default PlanningView;
