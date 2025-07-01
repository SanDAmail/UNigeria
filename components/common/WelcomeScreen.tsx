

import React from 'react';
import { Icons } from '../../constants';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 bg-adire-pattern z-50 flex items-center justify-center p-4 animate-fade-in-down">
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-10 text-center flex flex-col max-h-[90vh]">
        
        <header className="flex-shrink-0">
            <Icons.FlyingFlagLogo className="w-16 h-16 mx-auto" />
            <h1 className="text-4xl font-bold mt-4 text-primary-green">Welcome to UNigeria</h1>
            <p className="text-lg text-secondary mt-2">
                Your Gateway to Informed Civic Engagement.
            </p>
            <div className="w-24 h-1 bg-accent-gold mx-auto my-6 rounded-full"></div>
        </header>

        <main className="flex-1 overflow-y-auto px-2 md:px-4 text-center space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-primary mb-2">Our Mission: Bridging the Civic Information Divide</h2>
                <p className="text-secondary leading-relaxed">
                    Accessing reliable, centralized information on governance in Nigeria is a significant challenge. Disparate and often outdated data hinders citizens' ability to make informed decisions, ensure accountability, and engage meaningfully in our nation's civic life.
                </p>
            </div>

            <div>
                 <h2 className="text-xl font-semibold text-primary mb-3">The UNigeria Platform: A Unified Civic Hub</h2>
                 <p className="text-secondary leading-relaxed mb-4">
                    UNigeria confronts this challenge with a unified digital ecosystem for civic intelligence and engagement. Our platform is engineered to transform passive observation into active participation by providing the tools and data necessary for a well-informed citizenry.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FeatureCard
                        icon={<Icons.Map className="w-8 h-8 text-primary-green" />}
                        title="Explore States"
                        description="Dive into comprehensive profiles of all 36 states, detailing governance structures, economic data, and key initiatives."
                    />
                    <FeatureCard
                        icon={<Icons.UserGroup className="w-8 h-8 text-primary-green" />}
                        title="Engage Leaders"
                        description="Interact with sophisticated AI personas of Nigerian leaders to explore their policy platforms and historical context."
                    />
                     <FeatureCard
                        icon={<Icons.Flag className="w-8 h-8 text-primary-green" />}
                        title="Join Civic Forums"
                        description="Participate in moderated forums to discuss national policies, propose grassroots solutions, and collaborate with fellow citizens."
                    />
                    <FeatureCard
                        icon={<Icons.User className="w-8 h-8 text-primary-green" />}
                        title="Meet UNigerians"
                        description="Hear directly from the people by connecting with digital characters representing diverse experiences across Nigeria."
                    />
                </div>
            </div>
        </main>
        
        <footer className="mt-8 flex-shrink-0">
             <button 
                onClick={onComplete}
                className="w-full max-w-xs mx-auto bg-primary-green text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all text-lg shadow-lg hover:shadow-xl"
            >
                Start Exploring
            </button>
        </footer>

      </div>
    </div>
  );
};

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
    <div className="bg-app-light p-4 rounded-lg flex items-start space-x-4 text-left">
        <div className="flex-shrink-0 mt-1">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-primary">{title}</h3>
            <p className="text-sm text-secondary">{description}</p>
        </div>
    </div>
);

export default WelcomeScreen;
