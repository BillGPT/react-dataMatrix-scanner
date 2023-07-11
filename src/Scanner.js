// src/Scanner.js
import React, { useState } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';

const Scanner = () => {
    const [scannedCodes, setScannedCodes] = useState([]);

    const handleDecode = (result) => {
        // 如果列表中已经有这个二维码，就不添加
        if (!scannedCodes.includes(result)) {
            setScannedCodes((prevCodes) => [...prevCodes, result]);
        }
    };

    const handleError = (error) => {
        console.error(error?.message);
    };

    const scannerContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '35vh',  // 70% of viewport height
        width: '35vh',   // also 70% of viewport height, not width
        margin: '0 auto'
    };

    const scannerStyle = {
        height: '100%',  // 100% of parent container
        width: '100%',   // also 100% of parent container
    };

    const handleRemove = (index) => {
        setScannedCodes((prevCodes) => prevCodes.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        // 在这里，你可以把 scannedCodes 发送到你的数据库
        console.log(scannedCodes);
    };

    return (
        <div style={scannerContainerStyle}>
            <QrScanner
                onDecode={handleDecode}
                onError={handleError}
                containerStyle={scannerContainerStyle}
                videoStyle={scannerStyle}
            />

            <ul>
                {scannedCodes.map((code, index) => (
                    <li key={index}>
                        {code}
                        <button onClick={() => handleRemove(index)}>Delete</button>
                    </li>
                ))}
            </ul>

            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
};

export default Scanner;
