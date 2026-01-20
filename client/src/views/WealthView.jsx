import WealthCard from '../components/WealthCard';
import { useOutletContext } from 'react-router-dom';

const WealthView = () => {
    const { isPrivacyMode, handleGamification } = useOutletContext();

    return (
        <div className="max-w-4xl mx-auto pb-24 md:pb-6 space-y-6">
            <WealthCard isPrivacyMode={isPrivacyMode} onGamification={handleGamification} />
        </div>
    );
};

export default WealthView;
