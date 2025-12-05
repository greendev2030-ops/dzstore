"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { Product } from "@/types";

export default function AddToCartButton({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = () => {
        setIsAdding(true);
        addToCart(product);
        setTimeout(() => setIsAdding(false), 1000);
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`
                relative overflow-hidden group w-full py-4 rounded-xl font-bold text-white transition-all duration-300
                bg-gradient-to-r from-purple-600 to-blue-600
                ${isAdding ? 'cursor-not-allowed opacity-80' : 'hover:scale-[1.02] active:scale-[0.98]'}
            `}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_auto] animate-gradient" />

            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-200" />

            <span className="relative z-10 flex items-center justify-center gap-2">
                {isAdding ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding to Cart...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
                    </>
                )}
            </span>
        </button>
    );
}
