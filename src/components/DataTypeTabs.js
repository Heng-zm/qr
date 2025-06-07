import React from 'react';
import { FiLink, FiWifi, FiUser, FiMail, FiMessageSquare, FiMapPin } from 'react-icons/fi';

const TABS = [
    { id: 'text', label: 'URL/Text', icon: <FiLink /> },
    { id: 'wifi', label: 'WiFi', icon: <FiWifi /> },
    { id: 'vcard', label: 'Contact', icon: <FiUser /> },
    { id: 'email', label: 'Email', icon: <FiMail /> },
    { id: 'sms', label: 'SMS', icon: <FiMessageSquare /> },
    { id: 'geo', label: 'Geo', icon: <FiMapPin /> },
];

const DataTypeTabs = ({ activeType, setActiveType }) => {
    return (
        <div className="tabs-container">
            {TABS.map(tab => (
                <button
                    key={tab.id}
                    className={`tab-btn ${activeType === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveType(tab.id)}
                    title={tab.label}
                >
                    {tab.icon}
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

export default DataTypeTabs;