import React from "react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  timestamp: Date;
}

const ActivityItem = ({ title, description, icon, timestamp }: ActivityItemProps) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <div className="px-6 py-4 flex items-start">
        <div className="p-2 rounded-full bg-primary-100 text-primary mr-4">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-medium text-gray-800">{title}</h3>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
