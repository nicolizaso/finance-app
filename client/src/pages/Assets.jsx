import WealthCard from '../components/WealthCard';
import SavingsList from '../components/SavingsList';
import { useOutletContext } from 'react-router-dom';

const Assets = () => {
    const { isPrivacyMode } = useOutletContext();

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
            <div className="h-[500px]">
                 <WealthCard isPrivacyMode={isPrivacyMode} />
            </div>

            <SavingsList isPrivacyMode={isPrivacyMode} />
        </div>
    );
};

export default Assets;
