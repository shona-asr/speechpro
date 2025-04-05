import React from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const ActionCard = ({ title, description, icon, link }: ActionCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-1">
        <div className="w-12 h-12 rounded-full bg-primary-100 text-primary flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="font-medium text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t">
        <Link href={link} className="text-primary text-sm font-medium flex items-center">
          Start Now
          <ArrowRight className="ml-1 w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default ActionCard;
