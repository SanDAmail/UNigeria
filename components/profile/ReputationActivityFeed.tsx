
import React, { useState, useEffect } from 'react';
import { getReputationEvents } from '../../services/dbService';
import { ReputationEvent, ReputationEventType } from '../../types';
import { Icons } from '../../constants';

interface ReputationActivityFeedProps {
    userId: string;
}

const ReputationActivityFeed: React.FC<ReputationActivityFeedProps> = ({ userId }) => {
    const [events, setEvents] = useState<ReputationEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            const fetchedEvents = await getReputationEvents(userId);
            setEvents(fetchedEvents);
            setIsLoading(false);
        };
        fetchEvents();
    }, [userId]);
    
    const eventDetails: { [key in ReputationEventType]: { text: string; icon: React.ComponentType<{ className?: string }> } } = {
        'create_report': { text: "Filed a new report:", icon: Icons.DocumentText },
        'like_post_received': { text: "Received a like on post:", icon: Icons.Heart },
        'report_resolved': { text: "Report was marked as resolved:", icon: Icons.CheckCircle },
        'endorse_candidate': { text: "Endorsed a candidate:", icon: Icons.ShieldCheck },
        'receive_endorsement': { text: "Received an endorsement from:", icon: Icons.ShieldCheck },
    };

    if (isLoading) {
        return (
            <div className="space-y-3 p-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                        <div className="shimmer w-8 h-8 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                           <div className="shimmer h-4 w-3/4 rounded"></div>
                           <div className="shimmer h-3 w-1/2 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (events.length === 0) {
        return <p className="text-center text-sm text-secondary p-4">No recent activity found.</p>;
    }

    return (
        <div className="flow-root">
            <ul className="-mb-8">
                {events.map((event, eventIdx) => {
                    const EventIcon = eventDetails[event.type].icon;
                    return (
                        <li key={event.id}>
                            <div className="relative pb-8">
                                {eventIdx !== events.length - 1 ? (
                                    <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-ui-border dark:bg-dark-ui-border" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex items-start space-x-3">
                                    <div>
                                        <div className="relative px-1">
                                            <div className="h-8 w-8 bg-app-light dark:bg-dark-app-light rounded-full ring-4 ring-white dark:ring-dark-primary flex items-center justify-center">
                                                <EventIcon className="h-5 w-5 text-secondary dark:text-dark-text-secondary" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1 py-1.5">
                                        <div className="text-sm text-secondary dark:text-dark-text-secondary">
                                            {eventDetails[event.type].text}{' '}
                                            <span className="font-medium text-primary dark:text-dark-text-primary italic">
                                                "{event.related_text}"
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                                            <span className="whitespace-nowrap font-semibold text-primary-green">
                                                +{event.points} pts
                                            </span>
                                            <span className="text-gray-400">·</span>
                                            <span className="whitespace-nowrap">
                                                {new Date(event.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};

export default ReputationActivityFeed;
