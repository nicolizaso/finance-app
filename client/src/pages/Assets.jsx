import WealthCard from '../components/WealthCard';
import SavingsList from '../components/SavingsList';
import { useOutletContext } from 'react-router-dom';

const Assets = () => {
    const { isPrivacyMode, handleGamification } = useOutletContext();

    return (
        <div className="max-w-4xl mx-auto h-[500px]">
            <WealthCard isPrivacyMode={isPrivacyMode} onGamification={handleGamification} />
        </div>
    );
};

export default Assets;
