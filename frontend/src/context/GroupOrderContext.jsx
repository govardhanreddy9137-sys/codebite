import React, { createContext, useContext, useState } from 'react';

const GroupOrderContext = createContext();

export const useGroupOrder = () => useContext(GroupOrderContext);

export const GroupOrderProvider = ({ children }) => {
    // Stores the active group code if the user is in a group order
    const [groupCode, setGroupCode] = useState(null);
    const [isHost, setIsHost] = useState(false);

    // Simulates other members in the group order
    const [groupMembers, setGroupMembers] = useState([]);

    const startGroupOrder = () => {
        // Generate a random 6 character alphanumeric code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setGroupCode(code);
        setIsHost(true);
        // Initially just the host is in the group
        setGroupMembers([
            { id: 'me', name: 'You (Host)', items: [] }
        ]);
        return code;
    };

    const joinGroupOrder = (code, memberName) => {
        setGroupCode(code.toUpperCase());
        setIsHost(false);
        // Simulate that there are already members in this group order
        setGroupMembers([
            { id: 'host', name: 'Alex (Host)', items: [{ id: 1, name: 'Quinoa Salad', price: 12.00, quantity: 1 }] },
            { id: 'me', name: memberName || 'You', items: [] }
        ]);
    };

    const exitGroupOrder = () => {
        setGroupCode(null);
        setIsHost(false);
        setGroupMembers([]);
    };

    // This function can be called to simulate others adding to the cart
    const simulateMemberAddingItem = (item) => {
        setGroupMembers(prev => {
            const hostIndex = prev.findIndex(m => m.id === 'host');
            if (hostIndex >= 0) {
                const newMembers = [...prev];
                newMembers[hostIndex].items.push(item);
                return newMembers;
            }
            return prev;
        });
    };

    return (
        <GroupOrderContext.Provider value={{
            groupCode,
            isHost,
            groupMembers,
            startGroupOrder,
            joinGroupOrder,
            exitGroupOrder,
            simulateMemberAddingItem
        }}>
            {children}
        </GroupOrderContext.Provider>
    );
};
