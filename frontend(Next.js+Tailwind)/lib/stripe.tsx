'use client';

import React from 'react';

/**
 * Stripe Integration Module (Skeleton)
 * Maneja suscripciones tradicionales y pagos únicos.
 */
export const useStripePayment = () => {
    const processPayment = async (priceId: string) => {
        console.log(`REDIRECTING TO STRIPE FOR: ${priceId}`);
        // Logic: Llamar al backend para crear una Checkout Session
        // window.location.href = session.url;
    };

    return { processPayment };
};

export const StripeButton: React.FC<{ priceId: string }> = ({ priceId }) => {
    const { processPayment } = useStripePayment();
    
    return (
        <button 
           onClick={() => processPayment(priceId)}
           className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors uppercase text-[10px] tracking-widest"
        >
            Subscribe with Card
        </button>
    );
};
