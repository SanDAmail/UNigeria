

import React from 'react';
import { Icons } from '../../constants';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 bg-adire-pattern z-50 flex items-center justify-center p-4 animate-fade-in-down">
      <div className="w-full max-w-2xl bg-white/95 dark:bg-dark-primary/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-10 text-center flex flex-col max-h-[90vh]">
        
        <header className="flex-shrink-0">
            <Icons.FlyingFlagLogo className="w-16 h-16 mx-auto" />
            <h1 className="text-4xl font-bold mt-4 text-primary-green">Be The Voice Of Your Community</h1>
            <p className="text-lg text-secondary dark:text-dark-text-secondary mt-2">
                Your platform for civic action and community-led change.
            </p>
            <div className="w-24 h-1 bg-accent-gold mx-auto my-6 rounded-full"></div>
        </header>

        <main className="flex-1 overflow-y-auto px-2 md:px-4 text-center space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-primary dark:text-dark-text-primary mb-2">From Your Streets to the Halls of Power</h2>
                <p className="text-secondary dark:text-dark-text-secondary leading-relaxed">
                    For too long, the critical issues in our neighborhoods—from broken roads to underfunded schools—have gone unheard. UNigeria was built to bridge this gap. We believe that real change starts with you. By giving every Nigerian a platform to report, discuss, and organize, we can build a nation that is truly accountable to its people.
                </p>
            </div>

            <div>
                 <h2 className="text-xl font-semibold text-primary dark:text-dark-text-primary mb-3">A Unified Hub for Civic Action</h2>
                 <p className="text-secondary dark:text-dark-text-secondary leading-relaxed mb-4">
                    UNigeria is more than an app; it's a movement. We are transforming passive citizens into active agents of change by providing the tools and data necessary for a new era of civic engagement. Your voice matters. Let's build a better Nigeria, together.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FeatureCard
                        icon={<Icons.ChatBubbleBottomCenterText className="w-8 h-8 text-primary-green" />}
                        title="Report Community Issues"
                        description="Document and report local issues, from infrastructure to security, ensuring they are seen by representatives and the community."
                    />
                    <FeatureCard
                        icon={<Icons.User className="w-8 h-8 text-primary-green" />}
                        title="Connect with Representatives"
                        description="Chat directly with elected UNigerians from your community. Get help, provide feedback, and collaborate on solutions."
                    />
                     <FeatureCard
                        icon={<Icons.Map className="w-8 h-8 text-primary-green" />}
                        title="Explore States"
                        description="Dive into comprehensive profiles of all 36 states, detailing governance structures, economic data, and key initiatives."
                    />
                    <FeatureCard
                        icon={<Icons.UserGroup className="w-8 h-8 text-primary-green" />}
                        title="Engage Leaders"
                        description="Interact with AI personas of Nigerian leaders to explore their policy platforms and historical context."
                    />
                </div>
            </div>
        </main>
        
        <footer className="mt-8 flex-shrink-0">
             <button 
                onClick={onComplete}
                className="w-full max-w-xs mx-auto bg-primary-green text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all text-lg shadow-lg hover:shadow-xl"
            >
                Start Your Journey
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
    <div className="bg-app-light dark:bg-dark-app-light p-4 rounded-lg flex items-start space-x-4 text-left">
        <div className="flex-shrink-0 mt-1">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-primary dark:text-dark-text-primary">{title}</h3>
            <p className="text-sm text-secondary dark:text-dark-text-secondary">{description}</p>
        </div>
    </div>
);

export default WelcomeScreen;