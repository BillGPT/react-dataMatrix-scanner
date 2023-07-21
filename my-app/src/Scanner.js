// src/Scanner.js
import React, { useState, useEffect } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import AdminLogin from './Login';
import { readAndCompressImage } from 'browser-image-resizer';

const Scanner = () => {
    const [scannedCodes, setScannedCodes] = useState([]);
    const [files, setFiles] = useState([]);  // 修改为数组，用于存储多个文件
    const [previewUrls, setPreviewUrls] = useState([]);  // 修改为数组，用于存储多个预览 URL
    const [selectedOption, setSelectedOption] = useState('fengyin'); // 默认选择 'fengyin'
    const [cookies, setCookie, removeCookie] = useCookies(['admin', 'username']); // 注意这里添加了username
    const [username, setUsername] = useState(cookies.username); // 从cookie中获取username
    const [qrKey, setQrKey] = useState(0);

    useEffect(() => {
        setUsername(cookies.username); // 当cookies.username变化时，更新username状态
    }, [cookies.username]);

    const handleLogout = () => { // 添加退出登录的函数
        removeCookie('admin', { path: '/' });
    };

    const handleLogin = () => {
        setCookie('admin', true, { path: '/' });
        // 不再在这里设置username的cookie，将其移动到Login组件中
    };



    const handleDecode = (result) => {
        let prefix = selectedOption === 'fengyin' ? '封印：' : '电表：';
        let decoratedResult = `${prefix}${result}`;

        if (!scannedCodes.includes(decoratedResult)) {
            setScannedCodes((prevCodes) => [...prevCodes, decoratedResult]);
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
        height: '400px',
        width: '300px',
        margin: '0 auto'
    };

    const scannerStyle = {
        height: '300px',
        width: '300px',
    };

    const handleRemove = (index) => {
        setScannedCodes((prevCodes) => prevCodes.filter((_, i) => i !== index));
    };

    const handleFileChange = (e) => {
        const imageConfig = {
            quality: 0.7,  // reduce quality to decrease file size
            maxWidth: 800,  // maximum width is 800px
            maxHeight: 800,  // maximum height is 800px
            autoRotate: true,  // auto rotate image if needed
            debug: true,  // enable debug mode
        };

        const files = Array.from(e.target.files);
        const compressedFilesPromises = files.map((file) => readAndCompressImage(file, imageConfig));

        Promise.all(compressedFilesPromises)
            .then((compressedFiles) => {
                setFiles((prevFiles) => [...prevFiles, ...compressedFiles]);
                setPreviewUrls((prevUrls) => [...prevUrls, ...compressedFiles.map((file) => URL.createObjectURL(file))]);

                // 强制重新初始化 QrScanner
                setQrKey((prevKey) => prevKey + 1);
            })
            .catch((err) => console.error(err));
    };

    const handleFileRemove = (index) => {
        // 移除特定索引的文件和预览 URL
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        setPreviewUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        try {
            const fengyin = scannedCodes.filter(code => code.startsWith('封印：')).map(code => code.replace('封印：', ''));
            const formData = new FormData();
            formData.append('userId', username);
            formData.append('fengyin', JSON.stringify(fengyin));
            formData.append('fengyin_n', fengyin.length);
            formData.append('dianbiao', JSON.stringify(scannedCodes.filter(code => code.startsWith('电表：')).map(code => code.replace('电表：', ''))));

            // Append files to formData
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await axios.post('https://www.xihelin.com:15789/submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 60000, // Add a timeout limit for axios request. 5000ms in this case

            });

            if (response.data.success) {
                alert('上传成功！'); // If the response is successful, alert the user.
            } else {
                console.log('Error submitting data');
            }
        } catch (err) {
            alert(`An error occurred: ${err}. ${err.stack}`); // Add stack trace to the alert
        }
    };

    const buttonStyle = {
        backgroundColor: '#007BFF',
        border: 'none',
        color: 'white',
        padding: '15px 32px',
        textAlign: 'center',
        textDecoration: 'none',
        display: 'inline-block',
        fontSize: '16px',
        margin: '4px 2px',
        cursor: 'pointer',
        borderRadius: '4px'
    };

    const previewImageStyle = {
        maxHeight: '200px',
        maxWidth: '200px',
        marginTop: '20px'
    };

    const removeButtonStyle = {
        position: 'absolute',
        right: '10px',
        top: '10px',
        backgroundColor: '#f44336',  // 红色
        color: 'white',
        cursor: 'pointer',
    };

    const fileInputStyle = {
        display: 'none',  // 隐藏真正的文件上传 input
    };

    const buttonsContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',  // 使得两个按钮在一行内展示
        marginTop: '20px',
    };
    
    return (
        <div>
            {!cookies.admin && <AdminLogin onLogin={handleLogin} onSetUsername={setUsername} />}
            {cookies.admin &&

                <div style={scannerContainerStyle}>
                    <QrScanner
                        key={qrKey}
                        onDecode={handleDecode}
                        onError={handleError}
                        containerStyle={scannerContainerStyle}
                        videoStyle={scannerStyle}
                    />

                    <button onClick={handleLogout} style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '12px' }}>
                        退出登录
                    </button>

                    {/* Selector for 'fengyin' and 'dianbiao' */}
                    <div>
                        <label>
                            <input
                                type="radio"
                                value="fengyin"
                                checked={selectedOption === 'fengyin'}
                                onChange={(e) => setSelectedOption(e.target.value)}
                            />
                            封印
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="dianbiao"
                                checked={selectedOption === 'dianbiao'}
                                onChange={(e) => setSelectedOption(e.target.value)}
                            />
                            电表
                        </label>
                    </div>
                    <p style={{ position: 'absolute', top: '0', left: '0' }}>{username}</p>

                    {/* 修改为多文件上传 */}
                    <div style={buttonsContainerStyle}>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            id="file-upload"
                            style={fileInputStyle}
                            multiple  // 允许选择多个文件
                        />
                        <label htmlFor="file-upload" style={buttonStyle}>
                            上传图片
                        </label>
                        <button onClick={handleSubmit} style={buttonStyle}>
                            提交
                        </button>
                    </div>

                    <ul>
                        {scannedCodes.map((code, index) => (
                            <li key={index}>
                                {code}
                                <button style={{ borderRadius: '50%', backgroundColor: 'red', color: 'white' }} onClick={() => handleRemove(index)}>-</button>
                            </li>
                        ))}
                    </ul>


                    {/* 显示多个图片预览 */}
                    {previewUrls.map((url, index) => (
                        <div style={{ position: 'relative' }} key={index}>
                            <img src={url} alt="Preview" style={previewImageStyle} />
                            <button onClick={() => handleFileRemove(index)} style={removeButtonStyle}>Delete</button>
                        </div>
                    ))}
                </div>
            }
        </div>
    );
};

export default Scanner;
