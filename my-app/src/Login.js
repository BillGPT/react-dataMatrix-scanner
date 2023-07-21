// src/Login.js

import React, { useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';

function AdminLogin({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const [cookies, setCookie] = useCookies(['username']);  // 注意这里添加了username

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('https://www.xihelin.com:15789/user/login', { username, password });
            if (response.data.success) {
                onLogin();
                setCookie('username', response.data.name, { path: '/' });  // 登录成功后，设置username cookie
            } else {
                setError(true);
            }
        } catch (error) {
            setError(true);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="用户名" />
            <br></br>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" />
            <br></br>
            <button type="submit">登录</button>
            {error && <p>Error logging in.</p>}
        </form>
    );
}

export default AdminLogin;
