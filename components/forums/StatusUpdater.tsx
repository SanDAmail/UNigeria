import React, { useState } from 'react';
import { Report, ReportStatus } from '../../types';
import { useAppDispatch, useAppState } from '../../context/AppContext';
import { updateReportStatus } from '../../services/dbService';
import { Icons } from '../../constants';

interface StatusUpdaterProps {
  report: Report;
}

const StatusUpdater: React.FC<StatusUpdaterProps> = ({ report }) => {
  const dispatch = useAppDispatch();
  const { userProfile } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statuses: ReportStatus[] = ['New', 'Under Review', 'Acknowledged', 'Resolved'];

  const handleUpdateStatus = async (newStatus: ReportStatus) => {
    if (newStatus === report.status || isUpdating) return;
    
    setIsUpdating(true);
    setIsOpen(false);
    
    const originalStatus = report.status;
    // Optimistic update
    dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { reportId: report.id, status: newStatus } });

    try {
      await updateReportStatus(report.id, newStatus, report.author_id);
      dispatch({ type: 'SHOW_TOAST', payload: { message: `Report status updated to "${newStatus}"` } });
    } catch (error) {
      console.error("Failed to update status:", error);
      // Revert on failure
      dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { reportId: report.id, status: originalStatus } });
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'Failed to update status.', type: 'error' } });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="p-2 text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-text-primary rounded-full hover:bg-app-light dark:hover:bg-dark-app-light transition-colors"
        aria-label="Update report status"
      >
        <Icons.Pencil className="w-5 h-5" />
      </button>
      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-secondary rounded-lg shadow-xl py-1 z-20 border border-ui-border dark:border-dark-ui-border"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="px-4 py-2 text-xs font-semibold text-secondary dark:text-dark-text-secondary border-b border-ui-border dark:border-dark-ui-border">
            Set Status
          </div>
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => handleUpdateStatus(status)}
              className="block w-full text-left px-4 py-2 text-sm text-primary dark:text-dark-text-primary hover:bg-app-light dark:hover:bg-dark-app-light"
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusUpdater;