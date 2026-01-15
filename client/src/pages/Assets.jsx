import WealthCard from '../components/WealthCard';
import SavingsList from '../components/SavingsList';
import { useOutletContext } from 'react-router-dom';

const Assets = () => {
    const { isPrivacyMode, handleGamification } = useOutletContext();

    return (
        <div className="max-w-4xl mx-auto pb-24 space-y-6">
            <WealthCard isPrivacyMode={isPrivacyMode} onGamification={handleGamification} />
            <SavingsList isPrivacyMode={isPrivacyMode} />
        </div>
    );
};

export default Assets;
