'use client';
import dynamic from 'next/dynamic';
import React from 'react';

const ClientNoSSR = ({ children }) => {
    return <React.Fragment>{children}</React.Fragment>;
};

export default dynamic(() => Promise.resolve(ClientNoSSR), { ssr: false });
