import React from 'react';
import Image from "next/image";

const Loading = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Image src="/logo.png" alt="Resource Reserver" width={200} height={200} />
            <div className="animate-spin rounded-full border-t-4 border-blue-500 border-opacity-25 h-16 w-16"></div>
        </div>
    );
};

export default Loading;
