import WishlistCard from '../components/WishlistCard';
import SubscriptionWidget from '../components/SubscriptionWidget';
import { useOutletContext } from 'react-router-dom';

const PlanningView = () => {
    const { transactions, onRefresh, isPrivacyMode } = useOutletContext();

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] space-y-4 md:pb-6">
            <h3 className="text-xl font-bold text-white font-heading">Planificación</h3>
            {/* Top Row: Wishlist & Subscriptions */}
            <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-2 gap-6">
                <WishlistCard refreshTrigger={transactions} />
                <SubscriptionWidget />
            </div>
        </div>
    );
};

export default PlanningView;
