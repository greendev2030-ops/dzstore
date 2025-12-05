"use client";

import { motion } from "framer-motion";

export const FadeIn = ({
    children,
    delay = 0,
    className = "",
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay }}
        className={className}
    >
        {children}
    </motion.div>
);

export const SlideUp = ({
    children,
    delay = 0,
    className = "",
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className={className}
    >
        {children}
    </motion.div>
);

export const StaggerChildren = ({
    children,
    staggerDelay = 0.1,
    className = "",
}: {
    children: React.ReactNode;
    staggerDelay?: number;
    className?: string;
}) => (
    <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
            hidden: { opacity: 0 },
            show: {
                opacity: 1,
                transition: {
                    staggerChildren: staggerDelay,
                },
            },
        }}
        className={className}
    >
        {children}
    </motion.div>
);

export const StaggerItem = ({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 },
        }}
        className={className}
    >
        {children}
    </motion.div>
);
